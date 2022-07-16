import React from "react";
import Button from "../../../components/Buttons/Button";
import Link from "../../../components/Link";
import CurrencyLogo from "../../../components/Logo/CurrencyLogo";
import { InjectedModalProps, Modal } from "../../../components/Modal";
import useModal from "../../../components/Modal/useModal";
import { Currency } from "../../../config/entities/currency";
import { Token } from "../../../config/entities/token";
import { useUnsupportedTokens } from "../../../hooks/Tokens";
import useActiveWeb3React from "../../../hooks/useActiveWeb3React";
import { getBscScanLink } from "../../../utils/getBscScanLink";
import { wrappedCurrency } from "../../../utils/wrappedCurrency";

interface Props extends InjectedModalProps {
  currencies: (Currency | undefined)[];
}

const UnsupportedModal: React.FC<Props> = ({ currencies, onDismiss }) => {
  const { chainId } = useActiveWeb3React();
  const tokens =
    chainId && currencies
      ? currencies.map((currency) => {
          return wrappedCurrency(currency, chainId);
        })
      : [];

  const unsupportedTokens: { [address: string]: Token } = useUnsupportedTokens();

  return (
    <Modal title="Unsupported Assets" className="max-w-[420px]" onDismiss={onDismiss}>
      <div className="flex flex-col gap-5">
        {tokens.map((token) => {
          return (
            token &&
            unsupportedTokens &&
            Object.keys(unsupportedTokens).includes(token.address) && (
              <div className="flex gap-3 flex-col" key={token.address?.concat("not-supported")}>
                <div className="flex gap-1 items-center">
                  <CurrencyLogo currency={token} size="24px" />
                  <p>{token.symbol}</p>
                </div>
                {chainId && (
                  <Link className="text-sm" to={getBscScanLink(token.address, "address", chainId)}>
                    {token.address}
                  </Link>
                )}
              </div>
            )
          );
        })}
        <div className="flex flex-col gap-5">
          <p>
            Some assets are not available through this interface because they may not work well with our smart contract
            or we are unable to allow trading for legal reasons.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default function UnsupportedCurrencyFooter({ currencies }: { currencies: (Currency | undefined)[] }) {
  const [onPresentModal] = useModal(<UnsupportedModal currencies={currencies} />);
  return (
    <div className="py-2 w-full max-w-[400px] rounded-b-3xl text-center">
      <Button onClick={onPresentModal}>Read more about unsupported assets</Button>
    </div>
  );
}
