import React from "react";
import { useAppContext } from "../../hooks/useAppContext";
import useWallet from "../../hooks/useWallet";
import cls from "classnames";
import Button from "./Button";

interface ConnectWalletButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

const ConnectWalletButton = ({
  className,
  ...props
}: ConnectWalletButtonProps) => {
  const {
    krlWallet: { active, error, retry, isConnecting },
  } = useAppContext();

  const { onPresentConnectModal } = useWallet();

  const openModal = () => {
    onPresentConnectModal();
  };

  return (
    <React.Fragment>
      {!active && !error && (
        <Button
          variant="outline"
          disabled={isConnecting}
          onClick={openModal}
          className={cls(
            "inline-block text-base w-full",
            {
              "cursor-not-allowed hover:text-opacity-80": isConnecting,
            },
            className
          )}
          {...props}
        >
          {isConnecting ? "..." : "Connect wallet"}
        </Button>
      )}
      {!active && error && (
        <Button className="!text-red-600 w-full" onClick={retry}>
          Click to Retry
        </Button>
      )}
    </React.Fragment>
  );
};

export default ConnectWalletButton;
