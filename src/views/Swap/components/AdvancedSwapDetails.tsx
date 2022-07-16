import React from "react";
import QuestionHelper from "../../../components/widgets/QuestionHelper";
import { TradeType } from "../../../config/constants/types";
import { Trade } from "../../../config/entities/trade";
import { Field } from "../../../state/swap/actions";
import { useUserSlippageTolerance } from "../../../state/user/hooks";
import { computeSlippageAdjustedAmounts } from "../../../utils/prices";
import SwapRoute from "./SwapRoute";

function TradeSummary({ trade, allowedSlippage }: { trade: Trade; allowedSlippage: number }) {
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT;
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage);

  return (
    <div className="flex flex-col py-0 px-2">
      <div className="flex justify-between w-full">
        <div className="text-sm flex gap-1 items-center">
          {isExactIn ? "Minimum received" : "Maximum sold"}
          <QuestionHelper
            text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
            placement="top-start"
          />
        </div>
        <div className="flex">
          <p className="text-sm">
            {isExactIn
              ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                "-"
              : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ?? "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade;
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const showRoute = Boolean(trade && trade.route.path.length > 2);
  const [allowedSlippage] = useUserSlippageTolerance();

  return (
    <div className="flex flex-col gap-0">
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <>
              <div className="flex py-0 px-2">
                <span style={{ display: "flex", alignItems: "center" }}>
                  <p className="text-sm">Route</p>
                  <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
                </span>
                <SwapRoute trade={trade} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
