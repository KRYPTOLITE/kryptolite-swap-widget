import React, { useMemo, useState } from "react";
import Button from "../../../components/Buttons/Button";
import AutoRenewIcon from "../../../components/Svg/Icons/AutoRenew";
import QuestionHelper from "../../../components/widgets/QuestionHelper";
import { TradeType } from "../../../config/constants/types";
import { Trade } from "../../../config/entities/trade";
import { Field } from "../../../state/swap/actions";
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  warningSeverity,
  formatExecutionPrice,
} from "../../../utils/prices";
import FormattedPriceImpact from "./FormatedPriceImpact";

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm,
}: {
  trade: Trade;
  allowedSlippage: number;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  disabledConfirm: boolean;
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false);
  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [allowedSlippage, trade],
  );
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade]);
  const severity = warningSeverity(priceImpactWithoutFee);

  return (
    <>
      <div className="flex flex-col mt-6 p-4 rounded border bg-gray-100 text-sm gap-0.5">
        <div className="flex items-center justify-between text-xs">
          <p>Price</p>
          <div className="flex items-center justify-center text-right pl-1">
            {formatExecutionPrice(trade, showInverted)}
            <div onClick={() => setShowInverted(!showInverted)}>
              <AutoRenewIcon width="14px" />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-0.5">
          <div className="flex items-center gap-1">
            <p className="text-xs text-left">
              {trade.tradeType === TradeType.EXACT_INPUT ? "Minimum received" : "Maximum sold"}
            </p>
            <QuestionHelper
              placement="auto-end"
              text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
            />
          </div>
          <div className="flex text-xs">
            <p className="14px">
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? "-"
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? "-"}
            </p>
            <p>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <p className="text-xs">Price Impact</p>
            <QuestionHelper
              text="The difference between the market price and your price due to trade size."
              placement="auto-end"
            />
          </div>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </div>
      </div>
      <div className="flex">
        <Button
          variant={severity > 2 ? "danger" : "primary"}
          onClick={onConfirm}
          disabled={disabledConfirm}
          id="confirm-swap-or-send"
          className="mt-3 w-full"
        >
          {severity > 2 ? "Swap Anyway" : "Confirm Swap"}
        </Button>
        {swapErrorMessage ? (
          <div className="rounded-3xl flex items-center text-xs w-full pt-12 pr-5 p-4 -mt-8 -z-0">
            {swapErrorMessage}
          </div>
        ) : null}
      </div>
    </>
  );
}
