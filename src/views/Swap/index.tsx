import JSBI from "jsbi";
import React, { Fragment } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/Buttons/Button";
import ConnectWalletButton from "../../components/Buttons/ConnectWalletButton";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import useModal from "../../components/Modal/useModal";
import Skeleton from "../../components/widgets/Skeleton";
import SlippageTabs from "../../components/widgets/TransactionSettings/TransactionSettings";
import { CurrencyAmount } from "../../config/entities/fractions/currencyAmount";
import { Token } from "../../config/entities/token";
import { Trade } from "../../config/entities/trade";
import { useAllTokens, useCurrency } from "../../hooks/Tokens";
import { useIsTransactionUnsupported } from "../../hooks/Trades";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import { ApprovalState, useApproveCallbackFromTrade } from "../../hooks/useApprovalCallback";
import { useSwapCallback } from "../../hooks/useSwapCallback";
import useWrapCallback, { WrapType } from "../../hooks/useWrapCallback";
import { Field } from "../../state/swap/actions";
import { useDefaultsCurrency, useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from "../../state/swap/hooks";
import { useUserSingleHopOnly, useUserSlippageTolerance } from "../../state/user/hooks";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import { computeTradePriceBreakdown, warningSeverity } from "../../utils/prices";
import shouldShowSwapWarning from "../../utils/shouldShowSwapWarning";
import AdvancedSwapDetailsDropdown from "./components/AdvancedSwapDetailsDropdown";
import confirmPriceImpactWithoutFee from "./components/ConfirmPriceImpactWithoutFee";
import ConfirmSwapModal from "./components/ConfirmSwapModal";
import CurrencyInputHeader from "./components/CurrencyInputHeader";
import SwapWarningModal from "./components/SwapWarningModal";
import TradePrice from "./components/TradePrice";
import UnsupportedCurrencyFooter from "./components/UnsupportedCurrencyFooter";
import useRefreshBlockNumberID from "./hooks/useRefreshBlockNumber";
import Link from "../../components/Link";

interface SwapProps {
  baseToken: string;
}

export default function Swap({ baseToken }: SwapProps) {
  const loadedUrlParams = useDefaultsCurrency(baseToken);
  const { refreshBlockNumber, isLoading } = useRefreshBlockNumberID();
  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ];
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  );

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens();
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !(token.address in defaultTokens);
    });

  const { account, active } = useActiveWeb3React();

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance();

  // swap state & price data
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState();

  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(independentField, typedValue, inputCurrency, outputCurrency);

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const trade = showWrap ? undefined : v2Trade;

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      };

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers(baseToken);
  const isValid = !swapInputError;
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput],
  );

  // modal and loading
  const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    tradeToConfirm: Trade | undefined;
    attemptingTxn: boolean;
    swapErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  });

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ""
      : parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };

  const route = trade?.route;
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  );
  const noRoute = !route;

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT]);
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput));

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage);

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);

  const [singleHopOnly] = useUserSingleHopOnly();

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return;
    }
    if (!swapCallback) {
      return;
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined });
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash });
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        });
      });
  }, [priceImpactWithoutFee, swapCallback, tradeToConfirm]);

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false);

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage, txHash });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, "");
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn });
  }, [attemptingTxn, swapErrorMessage, trade, txHash]);

  // swap warning state
  const [swapWarningCurrency, setSwapWarningCurrency] = useState(null);
  const [onPresentSwapWarningModal] = useModal(<SwapWarningModal swapCurrency={swapWarningCurrency} />, false);

  useEffect(() => {
    if (swapWarningCurrency) {
      onPresentSwapWarningModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapWarningCurrency]);

  const handleInputSelect = useCallback(
    (currencyInput) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, currencyInput, baseToken);
      const showSwapWarning = shouldShowSwapWarning(currencyInput);
      if (showSwapWarning) {
        setSwapWarningCurrency(currencyInput);
      } else {
        setSwapWarningCurrency(null);
      }
    },
    [onCurrencySelection],
  );

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact());
    }
  }, [maxAmountInput, onUserInput]);

  const handleOutputSelect = useCallback(
    (currencyOutput) => {
      onCurrencySelection(Field.OUTPUT, currencyOutput, baseToken);
      const showSwapWarning = shouldShowSwapWarning(currencyOutput);
      if (showSwapWarning) {
        setSwapWarningCurrency(currencyOutput);
      } else {
        setSwapWarningCurrency(null);
      }
    },

    [onCurrencySelection],
  );

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT);

  const [onPresentConfirmModal] = useModal(
    <ConfirmSwapModal
      trade={trade}
      originalTrade={tradeToConfirm}
      onAcceptChanges={handleAcceptChanges}
      attemptingTxn={attemptingTxn}
      txHash={txHash}
      allowedSlippage={allowedSlippage}
      onConfirm={handleSwap}
      swapErrorMessage={swapErrorMessage}
      customOnDismiss={handleConfirmDismiss}
    />,
    true,
    true,
    "confirmSwapModal",
  );

  const hasAmount = Boolean(parsedAmount);

  const onRefreshPrice = useCallback(() => {
    if (hasAmount) {
      refreshBlockNumber();
    }
  }, [hasAmount, refreshBlockNumber]);

  return (
    <div className="w-[328px]  p-3 rounded-md border">
      <CurrencyInputHeader
        title={"Swap"}
        subtitle={"Trade tokens in an instant"}
        hasAmount={hasAmount}
        onRefreshPrice={onRefreshPrice}
      />
      <div id="swap-page" style={{ minHeight: "412px" }}>
        <div className="flex flex-col gap-4">
          <CurrencyInputPanel
            label={independentField === Field.OUTPUT && !showWrap && trade ? "From (estimated)" : "From"}
            value={formattedAmounts[Field.INPUT]}
            showMaxButton={!atMaxAmountInput}
            currency={currencies[Field.INPUT]}
            onUserInput={handleTypeInput}
            onMax={handleMaxInput}
            onCurrencySelect={handleInputSelect}
            otherCurrency={currencies[Field.OUTPUT]}
            id="swap-currency-input"
          />
          <div className="flex flex-col justify-around">
            <div className="flex justify-center" style={{ padding: "0 1rem" }}>
              <Button
                variant="outline"
                className="shadow-sm text-xs py-1"
                onClick={() => {
                  setApprovalSubmitted(false); // reset 2 step UI for approvals
                  onSwitchTokens();
                }}
              >
                Switch
              </Button>
            </div>
          </div>
          <CurrencyInputPanel
            value={formattedAmounts[Field.OUTPUT]}
            onUserInput={handleTypeOutput}
            label={independentField === Field.INPUT && !showWrap && trade ? "To (estimated)" : "To"}
            showMaxButton={false}
            currency={currencies[Field.OUTPUT]}
            onCurrencySelect={handleOutputSelect}
            otherCurrency={currencies[Field.INPUT]}
            id="swap-currency-output"
          />
          <SlippageTabs />
          {showWrap ? null : (
            <div className="flex flex-col gap-2" style={{ padding: "0 16px" }}>
              <div className="flex gap-2 text-sm items-baseline">
                {Boolean(trade) && (
                  <Fragment>
                    <p>Price</p>
                    {isLoading ? (
                      <Skeleton className="ml-2" />
                    ) : (
                      <TradePrice
                        price={trade?.executionPrice}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                      />
                    )}
                  </Fragment>
                )}
              </div>
              {/* <p className="text-xs text-center text-blue-600">
                      Auto slippage is enabled your transaction will run at the best price possible
                    </p> */}
            </div>
          )}
        </div>
        <div className="mt-1">
          {swapIsUnsupported ? (
            <Button className="w-full" disabled>
              {"Unsupported Asset"}
            </Button>
          ) : !account ? (
            <ConnectWalletButton className="w-full" />
          ) : showWrap ? (
            <Button className="w-full" disabled={Boolean(wrapInputError)} onClick={onWrap}>
              {wrapInputError ?? (wrapType === WrapType.WRAP ? "Wrap" : wrapType === WrapType.UNWRAP ? "Unwrap" : null)}
            </Button>
          ) : noRoute && userHasSpecifiedInputOutput ? (
            <div className="bg-gray-100" style={{ textAlign: "center", padding: "0.75rem" }}>
              <p>Insufficient liquidity for this trade.</p>
              {singleHopOnly && <p>Try enabling multi-hop trades.</p>}
            </div>
          ) : showApproveFlow ? (
            <div className="flex justify-between">
              <Button
                variant={approval === ApprovalState.APPROVED ? "primary" : "danger"}
                onClick={approveCallback}
                disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                className="w-[48%] text-sm"
              >
                {approval === ApprovalState.PENDING ? (
                  <div className="flex gap-1 justify-center">{"Enabling..."}</div>
                ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                  "Enabled"
                ) : (
                  `Enable ${currencies[Field.INPUT]?.symbol ?? ""}`
                )}
              </Button>
              <Button
                variant={isValid && priceImpactSeverity > 2 ? "danger" : "primary"}
                onClick={() => {
                  setSwapState({
                    tradeToConfirm: trade,
                    attemptingTxn: false,
                    swapErrorMessage: undefined,
                    txHash: undefined,
                  });
                  onPresentConfirmModal();
                }}
                className="w-[48%] text-sm"
                id="swap-button"
                disabled={!isValid || approval !== ApprovalState.APPROVED || priceImpactSeverity > 3}
              >
                {priceImpactSeverity > 3 ? "Price Impact High" : priceImpactSeverity > 2 ? "Swap Anyway" : "Swap"}
              </Button>
            </div>
          ) : (
            <Button
              variant={isValid && priceImpactSeverity > 2 && !swapCallbackError ? "danger" : "primary"}
              onClick={() => {
                setSwapState({
                  tradeToConfirm: trade,
                  attemptingTxn: false,
                  swapErrorMessage: undefined,
                  txHash: undefined,
                });
                onPresentConfirmModal();
              }}
              id="swap-button"
              className="w-full text-sm"
              disabled={!isValid || priceImpactSeverity > 3 || !!swapCallbackError}
            >
              {swapInputError ||
                (priceImpactSeverity > 3 ? "Price Impact Too High" : priceImpactSeverity > 2 ? "Swap Anyway" : "Swap")}
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          Powered by{" "}
          <Link to="https://kryptolite.rocks" className="text-primary-800 font-bold">
            KRYPTOLITE
          </Link>
        </p>
      </div>
      {!swapIsUnsupported ? (
        trade && <AdvancedSwapDetailsDropdown trade={trade} />
      ) : (
        <UnsupportedCurrencyFooter currencies={[currencies.INPUT, currencies.OUTPUT]} />
      )}
    </div>
  );
}
