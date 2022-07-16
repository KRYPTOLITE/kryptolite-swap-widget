import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import useActiveWeb3React from "./useActiveWeb3React";
import { useMemo } from "react";
import { INITIAL_ALLOWED_SLIPPAGE } from "../config/constants";
import { useTransactionAdder } from "../state/transactions/hooks";
import { calculateGasMargin } from "../utils";
import isZero from "../utils/isZero";
import { useSwapCallArguments } from "./useSwapCallArguments";
import { SwapParameters } from "../config/constants/router";
import { Trade } from "../config/entities/trade";
import { useGasPrice } from "../state/user/hooks";

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  contract: Contract;
  parameters: SwapParameters;
}

interface SuccessfulCall extends SwapCallEstimate {
  gasEstimate: BigNumber;
}

interface FailedCall extends SwapCallEstimate {
  error: string;
}

interface SwapCallEstimate {
  call: SwapCall;
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number, // in bips
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React();
  const gasPrice = useGasPrice();

  const swapCalls = useSwapCallArguments(trade, allowedSlippage + INITIAL_ALLOWED_SLIPPAGE);

  const addTransaction = useTransactionAdder();

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: "Missing dependencies" };
    }
    if (!account) {
      return { state: SwapCallbackState.LOADING, callback: null, error: null };
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const estimatedCalls: SwapCallEstimate[] = await Promise.all(
          swapCalls.map((call) => {
            const {
              parameters: { methodName, args, value },
              contract,
            } = call;
            const options = !value || isZero(value) ? {} : { value };

            return contract.estimateGas[methodName](...args, options)
              .then((gasEstimate) => {
                return {
                  call,
                  gasEstimate,
                };
              })
              .catch((gasError) => {
                console.error("Gas estimate failed, trying to extract error", call);

                return contract.callStatic[methodName](...args, options)
                  .then((result) => {
                    console.error("Unexpected successful call after failed estimate gas", call, gasError, result);
                    return { call, error: "Unexpected issue with estimating the gas. Please try again." };
                  })
                  .catch((callError) => {
                    console.error("Call threw error", call, callError);

                    return { call, error: swapErrorToUserReadableMessage(callError) };
                  });
              });
          }),
        );

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        const successfulEstimation = estimatedCalls.find(
          (el, ix, list): el is SuccessfulCall =>
            "gasEstimate" in el && (ix === list.length - 1 || "gasEstimate" in list[ix + 1]),
        );

        if (!successfulEstimation) {
          const errorCalls = estimatedCalls.filter((call): call is FailedCall => "error" in call);
          if (errorCalls.length > 0) throw new Error(errorCalls[errorCalls.length - 1].error);
          throw new Error("Unexpected error. Could not estimate gas for the swap.");
        }

        const {
          call: {
            contract,
            parameters: { methodName, args, value },
          },
          gasEstimate,
        } = successfulEstimation;

        return contract[methodName](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          gasPrice,
          ...(value && !isZero(value) ? { value, from: account } : { from: account }),
        })
          .then((response: any) => {
            const inputSymbol = trade.inputAmount.currency.symbol;
            const outputSymbol = trade.outputAmount.currency.symbol;
            const inputAmount = trade.inputAmount.toSignificant(3);
            const outputAmount = trade.outputAmount.toSignificant(3);

            const summary = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`;

            addTransaction(response, {
              summary,
              type: "swap",
            });

            return response.hash;
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error("Transaction rejected.");
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, methodName, args, value);
              throw new Error(`Swap failed: ${swapErrorToUserReadableMessage(error)}`);
            }
          });
      },
      error: null,
    };
  }, [trade, library, account, chainId, swapCalls, gasPrice, addTransaction]);
}

/**
 * This is hacking out the revert reason from the ethers provider thrown error however it can.
 * This object seems to be undocumented by ethers.
 * @param error an error from the ethers provider
 */
function swapErrorToUserReadableMessage(error: any) {
  let reason: string | undefined;
  while (error) {
    reason = error.reason ?? error.data?.message ?? error.message ?? reason;
    // eslint-disable-next-line no-param-reassign
    error = error.error ?? error.data?.originalError;
  }

  if (reason?.indexOf("execution reverted: ") === 0) reason = reason.substring("execution reverted: ".length);

  switch (reason) {
    case "TransferHelper: TRANSFER_FROM_FAILED":
      return "The input token cannot be transferred. There may be an issue with the input token.";
    default:
      if (reason?.indexOf("undefined is not an object") !== -1) {
        console.error(error, reason);
        return "An error occurred when trying to execute this swap. There may be an incompatibility with the token you are trading.";
      }
      return `Unknown error ${reason}. Try increasing your slippage tolerance.`;
  }
}
