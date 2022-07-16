import React, { useCallback } from "react";
import { ChainId } from "../../config/constants";
import { Currency } from "../../config/entities/currency";
import { Token } from "../../config/entities/token";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import { WrappedTokenInfo } from "../../state/types";
import { getBscScanLink } from "../../utils/getBscScanLink";
import { registerToken } from "../../utils/wallet";
import { wrappedCurrency } from "../../utils/wrappedCurrency";
import Button from "../Buttons/Button";
import Link from "../Link";
import { InjectedModalProps } from "../Modal";
import { ModalBody, ModalCloseButton, ModalContainer, ModalHeader, ModalTitle } from "../Modal/Modal";
import MetamaskIcon from "../Svg/Icons/Metamask";

function ConfirmationPendingContent({ pendingText }: { pendingText: string }) {
  return (
    <div className="w-full">
      <div className="py-6 animate-pulse">pending...</div>
      <div className="flex flex-col justify-center">
        <p className="p-5">Waiting For Confirmation</p>
        <div className="flex flex-col gap-3">
          <p className="font-bold text-sm text-center">{pendingText}</p>
        </div>
        <p className="text-sm text-center">Confirm this transaction in your wallet</p>
      </div>
    </div>
  );
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
}: {
  onDismiss: () => void;
  hash: string | undefined;
  chainId: ChainId;
  currencyToAdd?: Currency | undefined;
}) {
  const { library } = useActiveWeb3React();

  const token: Token | undefined = wrappedCurrency(currencyToAdd, chainId);

  return (
    <div>
      <div className="flex flex-col gap-3 justify-center">
        <p className="text-xl">Transaction Submitted</p>
        {chainId && hash && (
          <Link className="text-sm" to={getBscScanLink(hash, "transaction", chainId)}>
            View on BscScan
          </Link>
        )}
        {currencyToAdd && library?.provider?.isMetaMask && token && (
          <Button
            className="mt-3 w-auto"
            onClick={() =>
              registerToken(
                token.address,
                token.symbol ?? "",
                token.decimals,
                token instanceof WrappedTokenInfo ? token.logoURI : undefined,
              )
            }
          >
            <div className="flex items-center">
              {`Add ${currencyToAdd.symbol} to Metamask`}
              <MetamaskIcon width="16px" className="ml-2" />
            </div>
          </Button>
        )}
        <Button onClick={onDismiss} className="mt-5">
          Close
        </Button>
      </div>
    </div>
  );
}

export function ConfirmationModalContent({
  bottomContent,
  topContent,
}: {
  topContent: () => React.ReactNode;
  bottomContent: () => React.ReactNode;
}) {
  return (
    <div>
      <div>{topContent()}</div>
      <div>{bottomContent()}</div>
    </div>
  );
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div>
      <div className="flex justify-center flex-col text-center break-words text-base text-red-600">
        <p>{message}</p>
      </div>
      <div className="flex justify-center pt-6">
        <Button onClick={onDismiss}>Dismiss</Button>
      </div>
    </div>
  );
}

interface ConfirmationModalProps {
  title: string;
  customOnDismiss?: () => void;
  hash: string | undefined;
  content: () => React.ReactNode;
  attemptingTxn: boolean;
  pendingText: string;
  currencyToAdd?: Currency | undefined;
}

const TransactionConfirmationModal: React.FC<InjectedModalProps & ConfirmationModalProps> = ({
  title,
  onDismiss,
  customOnDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
}) => {
  const { chainId } = useActiveWeb3React();

  const handleDismiss = useCallback(() => {
    if (customOnDismiss) {
      customOnDismiss();
    }
    onDismiss?.();
  }, [customOnDismiss, onDismiss]);

  if (!chainId) return null;

  return (
    <ModalContainer>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalCloseButton onDismiss={handleDismiss} />
      </ModalHeader>
      <ModalBody className="text-center">
        {attemptingTxn ? (
          <ConfirmationPendingContent pendingText={pendingText} />
        ) : hash ? (
          <TransactionSubmittedContent
            chainId={chainId}
            hash={hash}
            onDismiss={handleDismiss}
            currencyToAdd={currencyToAdd}
          />
        ) : (
          content()
        )}
      </ModalBody>
    </ModalContainer>
  );
};

export default TransactionConfirmationModal;
