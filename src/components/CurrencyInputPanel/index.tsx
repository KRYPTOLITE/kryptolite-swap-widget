import React from "react";
import { Currency } from "../../config/entities/currency";
import { Pair } from "../../config/entities/pair";
import { Token } from "../../config/entities/token";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import { WrappedTokenInfo } from "../../state/types";
import { useCurrencyBalance } from "../../state/wallet/hooks";
import { registerToken } from "../../utils/wallet";
import Button from "../Buttons/Button";
import useModal from "../Modal/useModal";
import cls from "classnames";
import ChevronDownIcon from "../Svg/Icons/ChevronDown";
import { CopyButton } from "../widgets/CopyButton";
import { isAddress } from "../../utils";
import CurrencyLogo from "../Logo/CurrencyLogo";
import CurrencySearchModal from "../widgets/SearchModal/CurrencySearchModal";
import MetamaskIcon from "../Svg/Icons/Metamask";
import DoubleCurrencyLogo from "../Logo/DoubleCurrencyLogo";
import NumericalInput from "./NumericalInput";

interface CurrencyInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onMax?: () => void;
  showMaxButton: boolean;
  label?: string;
  onCurrencySelect: (currency: Currency) => void;
  currency?: Currency | null;
  disableCurrencySelect?: boolean;
  pair?: Pair | null;
  otherCurrency?: Currency | null;
  id: string;
}
export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label,
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  pair = null, // used for double token logo
  otherCurrency,
  id,
}: CurrencyInputPanelProps) {
  const { account, library } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined);

  const token = pair ? pair.liquidityToken : currency instanceof Token ? currency : null;
  const tokenAddress = token ? isAddress(token.address) : null;

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={currency}
      otherSelectedCurrency={otherCurrency}
    />,
  );
  return (
    <div className="relative" id={id}>
      <div className="flex items-center mb-1 justify-between">
        <div className="flex">
          <Button
            className="open-currency-select-button py-0 px-2"
            // selected={!!currency}
            onClick={() => {
              if (!disableCurrencySelect) {
                onPresentCurrencyModal();
              }
            }}
          >
            <div className="flex items-center justify-between">
              {pair ? (
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
              ) : currency ? (
                <CurrencyLogo currency={currency} size="24px" style={{ marginRight: "8px" }} />
              ) : null}
              {pair ? (
                <p id="pair" className="font-bold">
                  {pair?.token0.symbol}:{pair?.token1.symbol}
                </p>
              ) : (
                <p id="pair" className="font-bold">
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                        currency.symbol.length - 5,
                        currency.symbol.length,
                      )}`
                    : currency?.symbol) || "Select a currency"}
                </p>
              )}
              {!disableCurrencySelect && <ChevronDownIcon width={24} />}
            </div>
          </Button>
          {token && tokenAddress ? (
            <div className="flex items-center gap-1">
              <CopyButton
                width="16px"
                buttonColor="textSubtle"
                text={tokenAddress}
                tooltipMessage="Token address copied"
                tooltipTop={-20}
                tooltipRight={40}
                tooltipFontSize={12}
              />
              {library?.provider?.isMetaMask && (
                <MetamaskIcon
                  style={{ cursor: "pointer" }}
                  width="16px"
                  onClick={() =>
                    registerToken(
                      tokenAddress,
                      token.symbol ?? "",
                      token.decimals,
                      token instanceof WrappedTokenInfo ? token.logoURI : undefined,
                    )
                  }
                />
              )}
            </div>
          ) : null}
        </div>
        {account && (
          <p onClick={onMax} className="text-gray-500 inline cursor-pointer text-sm text-right">
            {!!currency ? `Balance: ${selectedCurrencyBalance?.toSignificant(6) ?? "Loading"}` : " -"}
          </p>
        )}
      </div>
      <div className="flex flex-col relative rounded-3xl z-[1]">
        <label className="rounded-2xl shadow-md block w-full border">
          <div className="flex items-center w-full text-xs leading-4 pt-3 pr-4 pb-0 pl-4">
            <NumericalInput
              className="w-full"
              value={value}
              onUserInput={(val) => {
                onUserInput(val);
              }}
            />
          </div>
          <div
            className={cls("flex items-center justify-end")}
            style={{ padding: disableCurrencySelect ? "0.75rem 0.5rem 0.75rem 1rem" : "0.75rem 0.75rem 0.75rem 1rem" }}
          >
            {account && currency && showMaxButton && label !== "To" && (
              <Button variant="outline" className="rounded-full text-xs px-1 py-0.5" onClick={onMax}>
                Max
              </Button>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}
