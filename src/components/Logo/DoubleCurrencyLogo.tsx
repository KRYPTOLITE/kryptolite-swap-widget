import React from "react";
import CurrencyLogo from "./CurrencyLogo";
import cls from "classnames";
import { Currency } from "../../config/entities/currency";

interface DoubleCurrencyLogoProps {
  margin?: boolean;
  size?: number;
  currency0?: Currency;
  currency1?: Currency;
  className?: string;
}

export default function DoubleCurrencyLogo({ currency0, currency1, size = 20, className }: DoubleCurrencyLogoProps) {
  return (
    <div className={cls("flex", className)}>
      {currency0 && <CurrencyLogo currency={currency0} size={`${size.toString()}px`} style={{ marginRight: "4px" }} />}
      {currency1 && <CurrencyLogo currency={currency1} size={`${size.toString()}px`} />}
    </div>
  );
}
