import invariant from "tiny-invariant";
import { ETHER } from "../entities/currency";
import { CurrencyAmount } from "../entities/fractions/currencyAmount";
import { Percent } from "../entities/fractions/percent";
import { Trade } from "../entities/trade";
import { TradeType } from "./types";

/**
 * Options for producing the arguments to send call to the router.
 */
export interface TradeOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  allowedSlippage: Percent;

  /**
   * Whether any of the tokens in the path are fee on transfer tokens, which should be handled with special methods
   */
  feeOnTransfer?: boolean;

  /**
   * The referrer to the swap contract
   */
  referrer: string;
}

/**
 * The parameters to use in the call to the Router to execute a trade.
 */
export interface SwapParameters {
  /**
   * The method to call on the Router.
   */
  methodName: string;
  /**
   * The arguments to pass to the method, all hex encoded.
   */
  args: (string | string[])[];
  /**
   * The amount of wei to send in hex.
   */
  value: string;
}

function toHex(currencyAmount: CurrencyAmount) {
  return `0x${currencyAmount.raw.toString(16)}`;
}

const ZERO_HEX = "0x0";

/**
 * Represents the Router, and has static methods for helping execute trades.
 */
export abstract class Router {
  /**
   * Cannot be constructed.
   */
  private constructor() {}
  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trade to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapCallParameters(trade: Trade, options: TradeOptions): SwapParameters {
    const etherIn = trade.inputAmount.currency === ETHER;
    const etherOut = trade.outputAmount.currency === ETHER;
    // the router does not support both ether in and out
    invariant(!(etherIn && etherOut), "ETHER_IN_OUT");

    const amountIn: string = toHex(trade.maximumAmountIn(options.allowedSlippage));
    const amountOut: string = toHex(trade.minimumAmountOut(options.allowedSlippage));
    const refAddress = options.referrer;
    const path: string[] = trade.route.path.map((token) => token.address);

    const useFeeOnTransfer = Boolean(options.feeOnTransfer);

    let methodName: string;
    let args: (any | any[])[];
    let value: string;
    switch (trade.tradeType) {
      case TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = useFeeOnTransfer
            ? "swapExactETHForTokensSupportingFeeOnTransferTokens"
            : "swapExactETHForTokens";

          args = [["0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", refAddress, true], amountOut, path];
          value = amountIn;
        } else if (etherOut) {
          methodName = useFeeOnTransfer
            ? "swapExactTokensForETHSupportingFeeOnTransferTokens"
            : "swapExactTokensForETH";

          args = [["0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", refAddress, true], amountIn, amountOut, path];
          value = ZERO_HEX;
        } else {
          methodName = useFeeOnTransfer
            ? "swapExactTokensForTokensSupportingFeeOnTransferTokens"
            : "swapExactTokensForTokens";

          args = [["0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", refAddress, true], amountIn, amountOut, path];
          value = ZERO_HEX;
        }
        break;
      case TradeType.EXACT_OUTPUT:
        invariant(!useFeeOnTransfer, "EXACT_OUT_FOT");
        if (etherIn) {
          methodName = "swapETHForExactTokens";

          args = [["0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", refAddress, true], amountOut, path];
          value = amountIn;
        } else if (etherOut) {
          methodName = "swapTokensForExactETH";

          args = [["0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", refAddress, true], amountOut, amountIn, path];
          value = ZERO_HEX;
        } else {
          methodName = "swapTokensForExactTokens";

          args = [["0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", refAddress, true], amountOut, amountIn, path];
          value = ZERO_HEX;
        }
        break;
    }
    return {
      methodName,
      args,
      value,
    };
  }
}
