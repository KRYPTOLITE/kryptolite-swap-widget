import { ChainId } from "../config/constants";
import { Currency, ETHER } from "../config/entities/currency";
import { CurrencyAmount } from "../config/entities/fractions/currencyAmount";
import { TokenAmount } from "../config/entities/fractions/tokenAmount";
import { Token, WETH } from "../config/entities/token";

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === ETHER ? WETH[chainId] : currency instanceof Token ? currency : undefined;
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  chainId: ChainId | undefined,
): TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined;
  return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined;
}

export function unwrappedToken(token: Token): Currency {
  if (token.equals(WETH[token.chainId])) return ETHER;
  return token;
}
