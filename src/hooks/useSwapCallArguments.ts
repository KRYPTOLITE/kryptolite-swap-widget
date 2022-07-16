import { useMemo } from "react";
import { Contract } from "@ethersproject/contracts";
import useActiveWeb3React from "./useActiveWeb3React";
import JSBI from "jsbi";
import { SwapParameters, Router } from "../config/constants/router";
import { TradeType } from "../config/constants/types";
import { Percent } from "../config/entities/fractions/percent";
import { Trade } from "../config/entities/trade";
import { BIPS_BASE } from "../config/constants";
import { getRouterContract } from "../utils";
import { useAppContext } from "./useAppContext";

interface SwapCall {
  contract: Contract;
  parameters: SwapParameters;
}

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
export function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number, // in bips
): SwapCall[] {
  const { account, chainId, library } = useActiveWeb3React();
  const { refAddress } = useAppContext();

  return useMemo(() => {
    if (!trade || !account || !library || !account || !chainId) return [];

    const contract = getRouterContract(library, account);
    if (!contract) {
      return [];
    }

    const swapMethods = [];

    swapMethods.push(
      Router.swapCallParameters(trade, {
        feeOnTransfer: false,
        allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
        referrer: refAddress,
      }),
    );

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      swapMethods.push(
        Router.swapCallParameters(trade, {
          feeOnTransfer: true,
          allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
          referrer: refAddress,
        }),
      );
    }

    return swapMethods.map((parameters) => ({ parameters, contract }));
  }, [account, allowedSlippage, chainId, library, trade]);
}
