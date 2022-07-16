import React from "react";
import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from "./AdvancedSwapDetails";
import cls from "classnames";
import useLastTruthy from "../../../hooks/useLast";

export default function AdvancedSwapDetailsDropdown({ trade, ...rest }: AdvancedSwapDetailsProps) {
  const lastTrade = useLastTruthy(trade);

  return (
    <div
      className={cls("mt-4 pt-4 w-full max-w-[400px] rounded-2xl transition-transform duration-300", {
        "translate-y-0": Boolean(trade),
        "-translate-y-full": !Boolean(trade),
      })}
    >
      <AdvancedSwapDetails {...rest} trade={trade ?? lastTrade ?? undefined} />
    </div>
  );
}
