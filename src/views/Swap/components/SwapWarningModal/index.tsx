import React from "react";
import { ModalHeader, ModalTitle, ModalBody, ModalContainer } from "../../../../components/Modal/Modal";
import Message from "../../../../components/widgets/Message/Message";
import { WrappedTokenInfo } from "../../../../state/types";
import Acknowledgement from "./Acknowledgement";

interface SwapWarningModalProps {
  swapCurrency: WrappedTokenInfo | null;
  onDismiss?: () => void;
}

const SwapWarningModal: React.FC<SwapWarningModalProps> = ({ swapCurrency, onDismiss }) => {
  const TOKEN_WARNINGS: { [index: WrappedTokenInfo["address"]]: { symbol: string; component: React.ReactNode } } = {};

  const SWAP_WARNING = swapCurrency != null && TOKEN_WARNINGS[swapCurrency.address];

  return SWAP_WARNING ? (
    <ModalContainer>
      <ModalHeader>
        <ModalTitle>{`Notice for trading ${SWAP_WARNING.symbol}`}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Message variant="warning" className="mb-6">
          <div>{SWAP_WARNING.component}</div>
        </Message>
        <Acknowledgement handleContinueClick={onDismiss} />
      </ModalBody>
    </ModalContainer>
  ) : (
    <div className="min-w-[280px] max-w-md" />
  );
};

export default SwapWarningModal;
