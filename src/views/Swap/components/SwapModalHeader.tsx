import React, { useMemo } from "react";
import Button from "../../../components/Buttons/Button";
import CurrencyLogo from "../../../components/Logo/CurrencyLogo";
import { ErrorIcon } from "../../../components/Svg";
import ArrowDownIcon from "../../../components/Svg/Icons/ArrowDown";
import { TradeType } from "../../../config/constants/types";
import { Trade } from "../../../config/entities/trade";
import { Field } from "../../../state/swap/actions";
import { computeSlippageAdjustedAmounts } from "../../../utils/prices";

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: Trade;
  allowedSlippage: number;
  showAcceptChanges: boolean;
  onAcceptChanges: () => void;
}) {
  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [trade, allowedSlippage],
  );
  // const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade]);
  // const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

  const amount =
    trade.tradeType === TradeType.EXACT_INPUT
      ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)
      : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6);
  const symbol =
    trade.tradeType === TradeType.EXACT_INPUT ? trade.outputAmount.currency.symbol : trade.inputAmount.currency.symbol;

  const tradeInfoText =
    trade.tradeType === TradeType.EXACT_INPUT
      ? `Output is estimated. You will receive at least ${amount} ${symbol} or the transaction will revert.`
      : `Input is estimated. You will sell at most ${amount} ${symbol} or the transaction will revert.`;

  const [estimatedText, transactionRevertText] = tradeInfoText.split(`${amount} ${symbol}`);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 justify-center">
        <div className="flex items-center gap-2">
          <CurrencyLogo currency={trade.inputAmount.currency} size="24px" style={{ marginRight: "12px" }} />
          <p
            className="text-2xl"
            color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? "primary" : "text"}
          >
            {trade.inputAmount.toSignificant(6)}
          </p>
        </div>
        <div className="0px">
          <p>{trade.inputAmount.currency.symbol}</p>
        </div>
      </div>
      <div className="flex items-center mx-auto">
        <ArrowDownIcon className="w-7 fill-gray-700" />
      </div>
      <div className="flex items-center gap-3 justify-center">
        <div className="flex gap-2 items-center">
          <CurrencyLogo currency={trade.outputAmount.currency} size="24px" style={{ marginRight: "12px" }} />
          <p
            className="text-2xl"
            /* fontSize="24px"
            color={
              priceImpactSeverity > 2
                ? "failure"
                : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
                ? "primary"
                : "text"
            } */
          >
            {trade.outputAmount.toSignificant(6)}
          </p>
        </div>
        <div className="0px">
          <p>{trade.outputAmount.currency.symbol}</p>
        </div>
      </div>
      {showAcceptChanges ? (
        <div className="flex justify-between w-full my-2">
          <div className="flex items-center w-full">
            <ErrorIcon className="mr-2 w-10" />
            <p className="font-bold">Price Updated</p>
          </div>
          <Button onClick={onAcceptChanges} className="text-sm">
            Accept
          </Button>
        </div>
      ) : null}
      <div className="flex flex-col gap-5 pt-6">
        <p className="text-sm">
          {estimatedText}
          <b>
            {amount} {symbol}
          </b>
          {transactionRevertText}
        </p>
      </div>
    </div>
  );
}
