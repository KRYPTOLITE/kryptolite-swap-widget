import { TokenList } from "@uniswap/token-lists";
import React, { useState } from "react";
import { Token } from "../../../config/entities/token";
import ButtonMenu from "../ButtonMenu/ButtonMenu";
import ButtonMenuItem from "../ButtonMenu/ButtonMenuItem";
import ManageLists from "./ManageLists";
import ManageTokens from "./ManageToken";

import { CurrencyModalView } from "./types";

export default function Manage({
  setModalView,
  setImportList,
  setImportToken,
  setListUrl,
}: {
  setModalView: (view: CurrencyModalView) => void;
  setImportToken: (token: Token) => void;
  setImportList: (list: TokenList) => void;
  setListUrl: (url: string) => void;
}) {
  const [showLists, setShowLists] = useState(true);

  return (
    <div>
      <ButtonMenu activeIndex={showLists ? 0 : 1} onItemClick={() => setShowLists((prev) => !prev)}>
        <ButtonMenuItem className="w-1/2 py-2 px-1" variant="outline">
          Lists
        </ButtonMenuItem>
        <ButtonMenuItem className="w-1/2 py-2 px-1" variant="outline">
          Tokens
        </ButtonMenuItem>
      </ButtonMenu>
      {showLists ? (
        <ManageLists setModalView={setModalView} setImportList={setImportList} setListUrl={setListUrl} />
      ) : (
        <ManageTokens setModalView={setModalView} setImportToken={setImportToken} />
      )}
    </div>
  );
}
