import React from "react";
import AutoRenewIcon from "../../../components/Svg/Icons/AutoRenew";
import { Price } from "../../../config/entities/fractions/price";

interface TradePriceProps {
  price?: Price;
  showInverted: boolean;
  setShowInverted: (showInverted: boolean) => void;
}

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const formattedPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6);

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency);
  const label = showInverted
    ? `${price?.quoteCurrency?.symbol} per ${price?.baseCurrency?.symbol}`
    : `${price?.baseCurrency?.symbol} per ${price?.quoteCurrency?.symbol}`;

  return (
    <p className="flex justify-center items-center">
      {show ? (
        <>
          {formattedPrice ?? "-"} {label}
          <button
            className="focus:outline-none h-6 w-6 border-none rounded-full p-1 text-sm ml-2 cursor-pointer flex justify-center items-center float-right"
            onClick={() => setShowInverted(!showInverted)}
          >
            <AutoRenewIcon width="14px" />
          </button>
        </>
      ) : (
        "-"
      )}
    </p>
  );
}
