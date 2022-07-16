import React from "react";
import { ONE_BIPS } from "../../../config/constants";
import { Percent } from "../../../config/entities/fractions/percent";

/**
 * Formatted version of price impact text with warning colors
 */
export default function FormattedPriceImpact({ priceImpact }: { priceImpact?: Percent }) {
  return (
    <div className="text-center text-red-600 text-xs">
      {priceImpact ? (priceImpact.lessThan(ONE_BIPS) ? "<0.01%" : `${priceImpact.toFixed(2)}%`) : "-"}
    </div>
  );
}
