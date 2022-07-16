/* eslint-disable no-restricted-syntax */
import React, { KeyboardEvent, RefObject, useCallback, useMemo, useRef, useState, useEffect, Fragment } from "react";
import { Currency, ETHER } from "../../../config/entities/currency";
import { Token } from "../../../config/entities/token";
import { useAllTokens, useToken, useIsUserAddedToken } from "../../../hooks/Tokens";
import useActiveWeb3React from "../../../hooks/useActiveWeb3React";
import { useAllLists, useInactiveListUrls } from "../../../state/lists/hooks";
import { WrappedTokenInfo, TagInfo } from "../../../state/types";
import { createFilterToken, useSortedTokensByQuery } from "./filtering";
import { FixedSizeList } from "react-window";
import useDebounce from "../../../hooks/useDebounce";
import useTokenComparator from "./sorting";
import ImportRow from "./ImportRow";
import CurrencyList from "./CurrencyList";
import { Input } from "../../Input";
import { isAddress } from "../../../utils";

interface CurrencySearchProps {
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
}

function useSearchInactiveTokenLists(search: string | undefined, minResults = 10): WrappedTokenInfo[] {
  const lists = useAllLists();
  const inactiveUrls = useInactiveListUrls();
  const { chainId } = useActiveWeb3React();
  const activeTokens = useAllTokens();
  return useMemo(() => {
    if (!search || search.trim().length === 0) return [];
    const filterToken = createFilterToken(search);
    const exactMatches: WrappedTokenInfo[] = [];
    const rest: WrappedTokenInfo[] = [];
    const addressSet: { [address: string]: true } = {};
    for (const url of inactiveUrls) {
      const list = lists[url].current;
      // eslint-disable-next-line no-continue
      if (!list) continue;
      for (const tokenInfo of list.tokens) {
        if (
          tokenInfo.chainId === chainId &&
          !(tokenInfo.address in activeTokens) &&
          !addressSet[tokenInfo.address] &&
          filterToken(tokenInfo)
        ) {
          const tags: TagInfo[] =
            tokenInfo.tags
              ?.map((tagId) => {
                if (!list.tags?.[tagId]) return undefined;
                return { ...list.tags[tagId], id: tagId };
              })
              ?.filter((x): x is TagInfo => Boolean(x)) ?? [];
          const wrapped: WrappedTokenInfo = new WrappedTokenInfo(tokenInfo, tags);
          addressSet[wrapped.address] = true;
          const trimmedSearchQuery = search.toLowerCase().trim();
          if (
            tokenInfo.name?.toLowerCase() === trimmedSearchQuery ||
            tokenInfo.symbol?.toLowerCase() === trimmedSearchQuery
          ) {
            exactMatches.push(wrapped);
          } else {
            rest.push(wrapped);
          }
        }
      }
    }
    return [...exactMatches, ...rest].slice(0, minResults);
  }, [activeTokens, chainId, inactiveUrls, lists, minResults, search]);
}

function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showImportView,
  setImportToken,
}: CurrencySearchProps) {
  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedQuery = useDebounce(searchQuery, 200);

  const [invertSearchOrder] = useState<boolean>(false);

  const allTokens = useAllTokens();

  // if they input an address, use it
  const searchToken = useToken(debouncedQuery);
  const searchTokenIsAdded = useIsUserAddedToken(searchToken);

  const showBNB: boolean = useMemo(() => {
    const s = debouncedQuery.toLowerCase().trim();
    return s === "" || s === "b" || s === "bn" || s === "bnb";
  }, [debouncedQuery]);

  const filteredTokens: Token[] = useMemo(() => {
    const filterToken = createFilterToken(debouncedQuery);
    return Object.values(allTokens).filter(filterToken);
  }, [allTokens, debouncedQuery]);

  const filteredQueryTokens = useSortedTokensByQuery(filteredTokens, debouncedQuery);

  const tokenComparator = useTokenComparator(invertSearchOrder);

  const filteredSortedTokens: Token[] = useMemo(() => {
    return [...filteredQueryTokens].sort(tokenComparator);
  }, [filteredQueryTokens, tokenComparator]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
    },
    [onCurrencySelect],
  );

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInput = useCallback((event) => {
    const input = event.target.value;
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
    fixedList.current?.scrollTo(0);
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const s = debouncedQuery.toLowerCase().trim();
        if (s === "bnb") {
          handleCurrencySelect(ETHER);
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0]);
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, debouncedQuery],
  );

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = useSearchInactiveTokenLists(debouncedQuery);

  const hasFilteredInactiveTokens = Boolean(filteredInactiveTokens?.length);

  const getCurrencyListRows = useCallback(() => {
    if (searchToken && !searchTokenIsAdded && !hasFilteredInactiveTokens) {
      return (
        <div className="flex flex-col px-0 h-full">
          <ImportRow token={searchToken} showImportView={showImportView} setImportToken={setImportToken} />
        </div>
      );
    }

    return Boolean(filteredSortedTokens?.length) || hasFilteredInactiveTokens ? (
      <div className="my-3 -mx-6">
        <CurrencyList
          height={390}
          showBNB={showBNB}
          currencies={filteredSortedTokens}
          inactiveCurrencies={filteredInactiveTokens}
          breakIndex={
            Boolean(filteredInactiveTokens?.length) && filteredSortedTokens ? filteredSortedTokens.length : undefined
          }
          onCurrencySelect={handleCurrencySelect}
          otherCurrency={otherSelectedCurrency}
          selectedCurrency={selectedCurrency}
          fixedListRef={fixedList}
          showImportView={showImportView}
          setImportToken={setImportToken}
        />
      </div>
    ) : (
      <div className="flex flex-col p-5 h-full">
        <p className="text-center mb-5">No results found.</p>
      </div>
    );
  }, [
    filteredInactiveTokens,
    filteredSortedTokens,
    handleCurrencySelect,
    hasFilteredInactiveTokens,
    otherSelectedCurrency,
    searchToken,
    searchTokenIsAdded,
    selectedCurrency,
    setImportToken,
    showBNB,
    showImportView,
  ]);

  return (
    <Fragment>
      <div className="flex flex-col gap-4">
        <div className="flex">
          <Input
            id="token-search-input"
            placeholder="Search name or paste address"
            autoComplete="off"
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
            onKeyDown={handleEnter}
          />
        </div>
      </div>
      {getCurrencyListRows()}
    </Fragment>
  );
}

export default CurrencySearch;
