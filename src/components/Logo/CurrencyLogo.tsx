import React, { useMemo } from "react";
import { Currency, ETHER } from "../../config/entities/currency";
import { Token } from "../../config/entities/token";
import useHttpLocations from "../../hooks/useHttpLocations";
import { WrappedTokenInfo } from "../../state/types";
import getTokenLogoURL from "../../utils/getTokenLogoUrl";
import Logo from "./index";
import BinanceIcon from "../Svg/Icons/Binance";

export default function CurrencyLogo({
  currency,
  size = "24px",
  style,
}: {
  currency?: Currency;
  size?: string;
  style?: React.CSSProperties;
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined);

  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return [];

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currency.address)];
      }
      return [getTokenLogoURL(currency.address)];
    }
    return [];
  }, [currency, uriLocations]);

  if (currency === ETHER) {
    return <BinanceIcon className="flex-none" width={size} style={style} />;
  }

  return (
    <Logo
      className="!flex-none w-6 h-6 max-w-[24px]"
      srcs={srcs}
      alt={`${currency?.symbol ?? "token"} logo`}
      style={style}
    />
  );
}
