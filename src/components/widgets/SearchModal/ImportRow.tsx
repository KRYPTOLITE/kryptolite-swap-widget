import React, { CSSProperties } from "react";
import { Token } from "../../../config/entities/token";
import { useIsUserAddedToken, useIsTokenActive } from "../../../hooks/Tokens";
import useActiveWeb3React from "../../../hooks/useActiveWeb3React";
import { useCombinedInactiveList } from "../../../state/lists/hooks";
import Button from "../../Buttons/Button";
import CurrencyLogo from "../../Logo/CurrencyLogo";
import ListLogo from "../../Logo/ListLogo";
import CheckmarkCircleIcon from "../../Svg/Icons/CheckmarkCircle";
import cls from "classnames";

export default function ImportRow({
  token,
  dim,
  showImportView,
  setImportToken,
  style,
  className,
}: {
  token: Token;
  style?: CSSProperties;
  dim?: boolean;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
  className?: string;
}) {
  // globals
  const { chainId } = useActiveWeb3React();

  // check if token comes from list
  const inactiveTokenList = useCombinedInactiveList();
  const list = chainId && inactiveTokenList?.[chainId]?.[token.address]?.list;

  // check if already active on list or local storage tokens
  const isAdded = useIsUserAddedToken(token);
  const isActive = useIsTokenActive(token);

  return (
    <div
      className={cls("px-5 w-full h-14 max-w-full grid gap-2 items-center place-content-between md:gap-4", className)}
      style={{ gridTemplateColumns: "auto minmax(auto, 1fr) auto", ...style }}
    >
      <CurrencyLogo currency={token} style={{ opacity: dim ? "0.6" : "1", width: 24, height: 24 }} />
      <div className="flex flex-col" style={{ opacity: dim ? "0.6" : "1" }}>
        <div className="flex items-center flex-wrap">
          <p className="mr-2 text-sm">{token.symbol}</p>
          <div>
            <div
              className="whitespace-nowrap overflow-hidden overflow-ellipsis max-w-[140px] text-xs"
              title={token.name}
            >
              {token.name}
            </div>
          </div>
        </div>
        {list && list.logoURI && (
          <div className="flex items-center">
            <p className="text-xs md:text-sm mr-1">via {list.name}</p>
            <ListLogo logoURI={list.logoURI} size="16px" />
          </div>
        )}
      </div>
      {!isActive && !isAdded ? (
        <Button
          onClick={() => {
            if (setImportToken) {
              setImportToken(token);
            }
            showImportView();
          }}
          className="text-xs"
        >
          Import
        </Button>
      ) : (
        <div className="max-w-fit flex items-center">
          <CheckmarkCircleIcon className="h-4 w-4 mr-2 ring ring-primary-600 rounded-full" />
          <p className="text-primary-600">Active</p>
        </div>
      )}
    </div>
  );
}
