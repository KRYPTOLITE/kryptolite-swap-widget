import React, { CSSProperties, MutableRefObject, useCallback, useMemo } from "react";
import { FixedSizeList } from "react-window";
import { Currency, ETHER } from "../../../config/entities/currency";
import { CurrencyAmount } from "../../../config/entities/fractions/currencyAmount";
import { Token, currencyEquals } from "../../../config/entities/token";
import { useIsUserAddedToken } from "../../../hooks/Tokens";
import useActiveWeb3React from "../../../hooks/useActiveWeb3React";
import { useCombinedActiveList } from "../../../state/lists/hooks";
import { useCurrencyBalance } from "../../../state/wallet/hooks";
import { wrappedCurrency } from "../../../utils/wrappedCurrency";
import CurrencyLogo from "../../Logo/CurrencyLogo";
import ImportRow from "./ImportRow";
import cls from "classnames";
import { isTokenOnList } from "../../../utils";
import QuestionHelper from "../QuestionHelper";

function currencyKey(currency: Currency): string {
  return currency instanceof Token ? currency.address : currency === ETHER ? "ETHER" : "";
}

function Balance({ balance }: { balance: CurrencyAmount }) {
  return (
    <p className="whitespace-nowrap overflow-hidden" title={balance.toExact()}>
      {balance.toSignificant(4)}
    </p>
  );
}

const MenuItem: React.FC<{
  style?: CSSProperties;
  disabled: boolean;
  selected: boolean;
  onClick: () => void;
  className?: string;
}> = ({ children, disabled, selected, onClick, className, style }) => {
  return (
    <div
      className={cls(
        "py-1 px-5 h-[56px] grid gap-2",
        {
          "opacity-40": disabled || selected,
          "cursor-pointer hover:bg-gray-100": !disabled,
          "pointer-events-none": disabled,
        },
        className,
      )}
      onClick={onClick}
      style={{ gridTemplateColumns: "auto minmax(auto, 1fr) minmax(0, 72px)", ...style }}
    >
      {children}
    </div>
  );
};

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
}: {
  currency: Currency;
  onSelect: () => void;
  isSelected: boolean;
  otherSelected: boolean;
  style: CSSProperties;
}) {
  const { account } = useActiveWeb3React();
  const key = currencyKey(currency);
  const selectedTokenList = useCombinedActiveList();
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency);
  const customAdded = useIsUserAddedToken(currency);
  const balance = useCurrencyBalance(account ?? undefined, currency);

  // only show add or remove buttons if not on selected list

  return (
    <MenuItem
      className={`token-item-${key}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
      style={style}
    >
      <CurrencyLogo currency={currency} size="24px" />
      <div className="flex flex-col -space-y-1">
        <p className="font-bold">{currency.symbol}</p>
        <p className="text-xs text-ellipsis max-w-[200px]">
          {!isOnSelectedList && customAdded && "Added by user •"} {currency.name}
        </p>
      </div>
      <div className="flex justify-self-end text-xs">
        {balance ? <Balance balance={balance} /> : account ? "Loading..." : null}
      </div>
    </MenuItem>
  );
}

export default function CurrencyList({
  height,
  currencies,
  inactiveCurrencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showBNB,
  showImportView,
  setImportToken,
  breakIndex,
}: {
  height: number;
  currencies: Currency[];
  inactiveCurrencies: Currency[];
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherCurrency?: Currency | null;
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>;
  showBNB: boolean;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
  breakIndex: number | undefined;
}) {
  const itemData: (Currency | undefined)[] = useMemo(() => {
    let formatted: (Currency | undefined)[] = showBNB
      ? [Currency.ETHER, ...currencies, ...inactiveCurrencies]
      : [...currencies, ...inactiveCurrencies];
    if (breakIndex !== undefined) {
      formatted = [...formatted.slice(0, breakIndex), undefined, ...formatted.slice(breakIndex, formatted.length)];
    }
    return formatted;
  }, [breakIndex, currencies, inactiveCurrencies, showBNB]);

  const { chainId } = useActiveWeb3React();

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Currency = data[index];
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency));
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency));
      const handleSelect = () => onCurrencySelect(currency);

      const token = wrappedCurrency(currency, chainId);

      const showImport = index > currencies.length;

      if (index === breakIndex || !data) {
        return (
          <div className="py-1 px-5 h-[56px] grid gap-4 items-center">
            <div className="py-2 px-3 rounded-lg">
              <div className="flex justify-between">
                <p className="text-sm">Expanded results from inactive Token Lists</p>
                <QuestionHelper
                  placement="auto-end"
                  text="Tokens from inactive lists. Import specific tokens below or click 'Manage' to activate more lists."
                />
              </div>
            </div>
          </div>
        );
      }

      if (showImport && token) {
        return (
          <ImportRow style={style} token={token} showImportView={showImportView} setImportToken={setImportToken} dim />
        );
      }
      return (
        <CurrencyRow
          style={{ ...style, [isSelected ? "position" : ""]: "relative" }}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      );
    },
    [
      selectedCurrency,
      otherCurrency,
      chainId,
      currencies.length,
      breakIndex,
      onCurrencySelect,
      showImportView,
      setImportToken,
    ],
  );

  const itemKey = useCallback((index: number, data: any) => currencyKey(data[index]), []);

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  );
}
