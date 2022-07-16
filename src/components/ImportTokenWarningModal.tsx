import React from "react";
import { Token } from "../config/entities/token";
import { InjectedModalProps } from "./Modal";
import { ModalBody, ModalCloseButton, ModalContainer, ModalHeader, ModalTitle } from "./Modal/Modal";
import ImportToken from "./widgets/SearchModal/importToken";

interface Props extends InjectedModalProps {
  tokens: Token[];
  onCancel: () => void;
}

const ImportTokenWarningModal: React.FC<Props> = ({ tokens, onDismiss, onCancel }) => {
  return (
    <ModalContainer>
      <ModalHeader>
        <ModalTitle>Import Token</ModalTitle>
        <ModalCloseButton
          onDismiss={() => {
            onDismiss?.();
            onCancel();
          }}
        />
      </ModalHeader>
      <ModalBody>
        <ImportToken tokens={tokens} handleCurrencySelect={onDismiss} />
      </ModalBody>
    </ModalContainer>
  );
};

export default ImportTokenWarningModal;
