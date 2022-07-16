import React, { useCallback, useMemo } from "react";
import { InjectedModalProps } from "../../../components/Modal";
import TransactionConfirmationModal, {
  TransactionErrorContent,
  ConfirmationModalContent,
} from "../../../components/TransactionConfirmationModal";
import { currencyEquals } from "../../../config/entities/token";
import { Trade } from "../../../config/entities/trade";
import SwapModalFooter from "./SwapModalFooter";
import SwapModalHeader from "./SwapModalHeader";

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  );
}
interface ConfirmSwapModalProps {
  trade?: Trade;
  originalTrade?: Trade;
  attemptingTxn: boolean;
  txHash?: string;
  allowedSlippage: number;
  onAcceptChanges: () => void;
  onConfirm: () => void;
  swapErrorMessage?: string;
  customOnDismiss?: () => void;
}

const ConfirmSwapModal: React.FC<InjectedModalProps & ConfirmSwapModalProps> = ({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  customOnDismiss,
  swapErrorMessage,
  attemptingTxn,
  txHash,
}) => {
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade],
  );

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null;
  }, [allowedSlippage, onAcceptChanges, showAcceptChanges, trade]);

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        trade={trade}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        allowedSlippage={allowedSlippage}
      />
    ) : null;
  }, [allowedSlippage, onConfirm, showAcceptChanges, swapErrorMessage, trade]);

  // text to show while loading
  const amountA = trade?.inputAmount?.toSignificant(6) ?? "",
    symbolA = trade?.inputAmount?.currency?.symbol ?? "",
    amountB = trade?.outputAmount?.toSignificant(6) ?? "",
    symbolB = trade?.outputAmount?.currency?.symbol ?? "";

  const pendingText = `Swapping ${amountA} ${symbolA} for ${amountB} ${symbolB}`;

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent topContent={modalHeader} bottomContent={modalBottom} />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage],
  );

  return (
    <TransactionConfirmationModal
      title="Confirm Swap"
      onDismiss={onDismiss}
      customOnDismiss={customOnDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      currencyToAdd={trade?.outputAmount.currency}
    />
  );
};

export default ConfirmSwapModal;
