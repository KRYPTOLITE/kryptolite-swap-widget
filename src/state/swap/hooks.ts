import { useCallback, useEffect, useState } from "react";
import { DEFAULT_INPUT_CURRENCY } from "../../config/constants";
import { useDispatch, useSelector } from "react-redux";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import { useTradeExactIn, useTradeExactOut } from "../../hooks/Trades";
import { computeSlippageAdjustedAmounts } from "../../utils/prices";
import { getTokenAddress } from "../../views/Swap/components/utils";
import tryParseAmount from "../../utils/tryParseAmount";
import { AppDispatch, AppState } from "../index";
import { useCurrencyBalances } from "../wallet/hooks";
import { Field, replaceSwapState, selectCurrency, switchCurrencies, typeInput } from "./actions";
import { SwapState } from "./reducer";
import { Currency, ETHER } from "../../config/entities/currency";
import { CurrencyAmount } from "../../config/entities/fractions/currencyAmount";
import { Token } from "../../config/entities/token";
import { Trade } from "../../config/entities/trade";
import { isAddress } from "../../utils";
import { useUserSlippageTolerance } from "../user/hooks";

export function useSwapState(): AppState["swap"] {
  return useSelector<AppState, AppState["swap"]>((state) => state.swap);
}

export function useSwapActionHandlers(baseCurrency: string): {
  onCurrencySelection: (field: Field, currency: Currency, baseCurrency: string) => void;
  onSwitchTokens: () => void;
  onUserInput: (field: Field, typedValue: string) => void;
} {
  const dispatch = useDispatch<AppDispatch>();
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency === ETHER ? "BNB" : "",
          baseCurrency,
        }),
      );
    },
    [dispatch],
  );

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies());
  }, [dispatch]);

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }));
    },
    [dispatch],
  );

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
  };
}

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some((token) => token.address === checksummedAddress) ||
    trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
  );
}

// Get swap price for single token disregarding slippage and price impact
export function useSingleTokenSwapInfo(
  inputCurrencyId: string | undefined,
  inputCurrency: Currency | undefined | null,
  outputCurrencyId: string | undefined,
  outputCurrency: Currency | undefined | null,
): { [key: string]: number } | null {
  const token0Address = getTokenAddress(inputCurrencyId);
  const token1Address = getTokenAddress(outputCurrencyId);

  const parsedAmount = tryParseAmount("1", inputCurrency ?? undefined);

  const bestTradeExactIn = useTradeExactIn(parsedAmount, outputCurrency ?? undefined);
  if (!inputCurrency || !outputCurrency || !bestTradeExactIn) {
    return null;
  }

  const inputTokenPrice = parseFloat(bestTradeExactIn?.executionPrice?.toSignificant(6));
  const outputTokenPrice = 1 / inputTokenPrice;

  return {
    [token0Address]: inputTokenPrice,
    [token1Address]: outputTokenPrice,
  };
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(
  independentField: Field,
  typedValue: string,
  inputCurrency: Currency | undefined | null,
  outputCurrency: Currency | undefined | null,
): {
  currencies: { [field in Field]?: Currency };
  currencyBalances: { [field in Field]?: CurrencyAmount };
  parsedAmount: CurrencyAmount | undefined;
  v2Trade: Trade | undefined;
  inputError?: string;
} {
  const { account } = useActiveWeb3React();

  const to = account;

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ]);

  const isExactIn: boolean = independentField === Field.INPUT;
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined);

  const bestTradeExactIn = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined);
  const bestTradeExactOut = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined);

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut;

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  };

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  };

  let inputError: string | undefined;
  if (!account) {
    inputError = "Connect Wallet";
  }

  if (!parsedAmount) {
    inputError = inputError ?? "Enter an amount";
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? "Select a token";
  }

  const formattedTo = isAddress(to);
  if (!to || !formattedTo) {
    inputError = inputError ?? "Enter a recipient";
  } else if (
    (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
    (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
  ) {
    inputError = inputError ?? "Invalid recipient";
  }

  const [allowedSlippage] = useUserSlippageTolerance(); // Convert to auto

  const slippageAdjustedAmounts =
    v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage);

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
  ];

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = `Insufficient ${amountIn.currency.symbol} balance`;
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
  };
}

export function parametersToSwapState(outCurrency: string): SwapState {
  let inputCurrency = DEFAULT_INPUT_CURRENCY;
  let outputCurrency = outCurrency;

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: "",
    independentField: Field.OUTPUT,
    pairDataById: {},
    derivedPairDataById: {},
    baseCurrencyId: outCurrency,
  };
}

// updates the swap state to use the defaults for a given network
export function useDefaultsCurrency(
  baseCurrency: string,
): { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined {
  const { chainId } = useActiveWeb3React();
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!chainId) return;
    const parsed = parametersToSwapState(baseCurrency);

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        baseCurrencyId: baseCurrency,
      }),
    );

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId });
  }, [dispatch, chainId]);

  return result;
}
