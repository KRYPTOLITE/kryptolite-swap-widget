import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import { TokenList, Version } from "@uniswap/token-lists";
import { CurrencyModalView } from "./types";
import { useSelector, useDispatch } from "react-redux";
import useFetchListCallback from "../../../hooks/useFetchListCallback";
import { AppState, AppDispatch } from "../../../state";
import { acceptListUpdate, removeList, enableList, disableList } from "../../../state/lists/actions";
import { useIsListActive, useAllLists, useActiveListUrls } from "../../../state/lists/hooks";
import uriToHttp from "../../../utils/uriToHttps";
import Button from "../../Buttons/Button";
import ListLogo from "../../Logo/ListLogo";
import Link from "../../Link";
import CogIcon from "../../Svg/Icons/Cog";
import { UNSUPPORTED_LIST_URLS } from "../../../config/constants/lists";
import CheckmarkIcon from "../../Svg/Icons/Checkmark";
import { useTooltip } from "../../../hooks/useTooltip";
import { Input } from "../../Input";
import { Checkbox } from "../../Checkbox";

function listVersionLabel(version: Version): string {
  return `v${version.major}.${version.minor}.${version.patch}`;
}

function listUrlRowHTMLId(listUrl: string) {
  return `list-row-${listUrl.replace(/\./g, "-")}`;
}

const ListRow = memo(function ListRow({ listUrl }: { listUrl: string }) {
  const listsByUrl = useSelector<AppState, AppState["lists"]["byUrl"]>((state) => state.lists.byUrl);
  const dispatch = useDispatch<AppDispatch>();
  const { current: list, pendingUpdate: pending } = listsByUrl[listUrl];

  const isActive = useIsListActive(listUrl);

  const handleAcceptListUpdate = useCallback(() => {
    if (!pending) return;
    dispatch(acceptListUpdate(listUrl));
  }, [dispatch, listUrl, pending]);

  const handleRemoveList = useCallback(() => {
    // eslint-disable-next-line no-alert
    if (window.confirm("Please confirm you would like to remove this list")) {
      dispatch(removeList(listUrl));
    }
  }, [dispatch, listUrl]);

  const handleEnableList = useCallback(() => {
    dispatch(enableList(listUrl));
  }, [dispatch, listUrl]);

  const handleDisableList = useCallback(() => {
    dispatch(disableList(listUrl));
  }, [dispatch, listUrl]);

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <div>
      <p>{list && listVersionLabel(list.version)}</p>
      <Link to={`https://tokenlists.org/token-list?url=${listUrl}`}>See</Link>
      <Button
        variant="danger"
        className="text-sm"
        onClick={handleRemoveList}
        disabled={Object.keys(listsByUrl).length === 1}
      >
        Remove
      </Button>
      {pending && (
        <Button onClick={handleAcceptListUpdate} className="text-sm">
          Update list
        </Button>
      )}
    </div>,
    { placement: "right-end", trigger: "click" },
  );

  if (!list) return null;

  return (
    <div
      className="border transition-all duration-200 items-center p-4 rounded-2xl flex"
      key={listUrl}
      id={listUrlRowHTMLId(listUrl)}
    >
      {tooltipVisible && tooltip}
      {list.logoURI ? (
        <ListLogo size="40px" style={{ marginRight: "1rem" }} logoURI={list.logoURI} alt={`${list.name} list logo`} />
      ) : (
        <div style={{ width: "24px", height: "24px", marginRight: "1rem" }} />
      )}
      <div className="flex flex-col" style={{ flex: "1" }}>
        <div className="flex">
          <p className="font-bold">{list.name}</p>
        </div>
        <div className="flex mt-1">
          <p className="text-xs mr-2 lowercase">{list.tokens.length} Tokens</p>
          <span ref={targetRef}>
            <CogIcon color="text" width="12px" />
          </span>
        </div>
      </div>
      <Checkbox
        name="confirmed"
        type="checkbox"
        checked={isActive}
        onChange={() => {
          if (isActive) {
            handleDisableList();
          } else {
            handleEnableList();
          }
        }}
        scale="sm"
      />
    </div>
  );
});

function ManageLists({
  setModalView,
  setImportList,
  setListUrl,
}: {
  setModalView: (view: CurrencyModalView) => void;
  setImportList: (list: TokenList) => void;
  setListUrl: (url: string) => void;
}) {
  const [listUrlInput, setListUrlInput] = useState<string>("");

  const lists = useAllLists();

  // sort by active but only if not visible
  const activeListUrls = useActiveListUrls();
  const [activeCopy, setActiveCopy] = useState<string[] | undefined>();
  useEffect(() => {
    if (!activeCopy && activeListUrls) {
      setActiveCopy(activeListUrls);
    }
  }, [activeCopy, activeListUrls]);

  const handleInput = useCallback((e) => {
    setListUrlInput(e.target.value);
  }, []);

  const fetchList = useFetchListCallback();

  const validUrl: boolean = useMemo(() => {
    return uriToHttp(listUrlInput).length > 0;
  }, [listUrlInput]);

  const sortedLists = useMemo(() => {
    const listUrls = Object.keys(lists);
    return listUrls
      .filter((listUrl) => {
        // only show loaded lists, hide unsupported lists
        return Boolean(lists[listUrl].current) && !UNSUPPORTED_LIST_URLS.includes(listUrl);
      })
      .sort((u1, u2) => {
        const { current: l1 } = lists[u1];
        const { current: l2 } = lists[u2];

        // first filter on active lists
        if (activeCopy?.includes(u1) && !activeCopy?.includes(u2)) {
          return -1;
        }
        if (!activeCopy?.includes(u1) && activeCopy?.includes(u2)) {
          return 1;
        }

        if (l1 && l2) {
          // Always make PancakeSwap list in top.
          const keyword = "pancakeswap";
          if (l1.name.toLowerCase().includes(keyword) || l2.name.toLowerCase().includes(keyword)) {
            return -1;
          }

          return l1.name.toLowerCase() < l2.name.toLowerCase()
            ? -1
            : l1.name.toLowerCase() === l2.name.toLowerCase()
            ? 0
            : 1;
        }
        if (l1) return -1;
        if (l2) return 1;
        return 0;
      });
  }, [lists, activeCopy]);

  // temporary fetched list for import flow
  const [tempList, setTempList] = useState<TokenList>();
  const [addError, setAddError] = useState<string | undefined>();

  useEffect(() => {
    async function fetchTempList() {
      fetchList(listUrlInput, false)
        .then((list) => setTempList(list))
        .catch(() => setAddError("Error importing list"));
    }
    // if valid url, fetch details for card
    if (validUrl) {
      fetchTempList();
    } else {
      setTempList(undefined);
      if (listUrlInput !== "") {
        setAddError("Enter valid list location");
      }
    }

    // reset error
    if (listUrlInput === "") {
      setAddError(undefined);
    }
  }, [fetchList, listUrlInput, validUrl]);

  // check if list is already imported
  const isImported = Object.keys(lists).includes(listUrlInput);

  // set list values and have parent modal switch to import list view
  const handleImport = useCallback(() => {
    if (!tempList) return;
    setImportList(tempList);
    setModalView(CurrencyModalView.importList);
    setListUrl(listUrlInput);
  }, [listUrlInput, setImportList, setListUrl, setModalView, tempList]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col">
        <div className="flex">
          <Input id="list-add-input" placeholder="https:// or ipfs://" value={listUrlInput} onChange={handleInput} />
        </div>
        {addError ? <p className="text-ellipsis overflow-hidden text-red-500 text-sm text-center">{addError}</p> : null}
      </div>
      {tempList && (
        <div className="flex flex-col pt-0">
          <div className="flex rounded flex-col py-3 px-5">
            <div className="flex justify-between">
              <div className="flex">
                {tempList.logoURI && <ListLogo logoURI={tempList.logoURI} size="40px" />}
                <div className="flex flex-col gap-1 ml-5">
                  <p className="font-bold">{tempList.name}</p>
                  <p className="text-sm lowercase">{tempList.tokens.length} Tokens</p>
                </div>
              </div>
              {isImported ? (
                <div className="flex space-x-3">
                  <CheckmarkIcon width="16px" />
                  <p>Loaded</p>
                </div>
              ) : (
                <Button onClick={handleImport}>Import</Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="py-4 px-0 h-full overflow-auto">
        <div className="flex flex-col gap-5">
          {sortedLists.map((listUrl) => (
            <ListRow key={listUrl} listUrl={listUrl} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManageLists;
