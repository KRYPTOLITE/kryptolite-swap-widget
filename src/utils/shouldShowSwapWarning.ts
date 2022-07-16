import SwapWarningTokens from "../config/constants/swapWarningTokens";
import { Token } from "../config/entities/token";

const swapWarningTokens = Object.values(SwapWarningTokens);

const shouldShowSwapWarning = (swapCurrency: Token) => {
  return swapWarningTokens.some((warningToken) => swapCurrency.address === warningToken.address);
};

export default shouldShowSwapWarning;
