import React, { useState } from "react";
import { Currency } from "../../../config/entities/currency";
import { Token } from "../../../config/entities/token";
import useActiveWeb3React from "../../../hooks/useActiveWeb3React";
import { useCombinedInactiveList } from "../../../state/lists/hooks";
import { getBscScanLink } from "../../../utils/getBscScanLink";
import truncateHash from "../../../utils/truncateHash";
import { useAddUserToken } from "../../../state/user/hooks";
import Link from "../../Link";
import Button from "../../Buttons/Button";
import { Checkbox } from "../../Checkbox";
import Message, { MessageText } from "../Message/Message";

interface ImportProps {
  tokens: Token[];
  handleCurrencySelect?: (currency: Currency) => void;
}

function ImportToken({ tokens, handleCurrencySelect }: ImportProps) {
  const { chainId } = useActiveWeb3React();

  const [confirmed, setConfirmed] = useState(false);

  const addToken = useAddUserToken();

  // use for showing import source on inactive tokens
  const inactiveTokenList = useCombinedInactiveList();

  return (
    <div className="flex flex-col">
      <Message variant="warning" className="text-sm">
        <MessageText>
          Anyone can create a BEP20 token on BSC with any name, including creating fake versions of existing tokens and
          tokens that claim to represent projects that do not have a token.
          <br />
          <br />
          If you purchase an arbitrary token, you may be unable to sell it back.
        </MessageText>
      </Message>

      {tokens.map((token) => {
        //@ts-ignore
        const list = chainId && inactiveTokenList?.[chainId]?.[token.address]?.list;
        const address = token.address ? `${truncateHash(token.address)}` : null;
        return (
          <div key={token.address} className="grid gap-1">
            {list !== undefined ? (
              <div className="p-2 text-base my-1">via {list.name}</div>
            ) : (
              <div className="text-red-500 text-xs my-2">This token is from an unknown source</div>
            )}
            <div className="flex items-center font-medium">
              <p className="mr-2">{token.name}</p>
              <p>({token.symbol})</p>
            </div>
            {chainId && (
              <div className="flex items-center justify-between w-full text-base">
                <p className="mr-1">{address}</p>
                <Link to={getBscScanLink(token.address, "address", chainId)} className="font-medium text-blue-600">
                  (View on BscScan)
                </Link>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center" onClick={() => setConfirmed(!confirmed)}>
          <Checkbox scale="sm" name="confirmed" checked={confirmed} onChange={() => setConfirmed(!confirmed)} />
          <p className="ml-2 text-sm font-medium" style={{ userSelect: "none" }}>
            I understand
          </p>
        </div>
        <Button
          variant="danger"
          disabled={!confirmed}
          onClick={() => {
            tokens.forEach((token) => addToken(token));
            if (handleCurrencySelect) {
              handleCurrencySelect(tokens[0]);
            }
          }}
          className="text-sm"
        >
          Import
        </Button>
      </div>
    </div>
  );
}

export default ImportToken;
