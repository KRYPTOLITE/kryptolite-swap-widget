import React, { useState, useCallback } from "react";
import { TokenList } from "@uniswap/token-lists";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../state";
import { enableList, removeList } from "../../../state/lists/actions";
import { useAllLists } from "../../../state/lists/hooks";
import Button from "../../Buttons/Button";
import { Checkbox } from "../../Checkbox";
import Message from "../Message/Message";
import useFetchListCallback from "../../../hooks/useFetchListCallback";
import ListLogo from "../../Logo/ListLogo";
import Link from "../../Link";

interface ImportProps {
  listURL: string;
  list: TokenList;
  onImport: () => void;
}

function ImportList({ listURL, list, onImport }: ImportProps) {
  const dispatch = useDispatch<AppDispatch>();

  // user must accept
  const [confirmed, setConfirmed] = useState(false);

  const lists = useAllLists();
  const fetchList = useFetchListCallback();

  // monitor is list is loading
  const adding = Boolean(lists[listURL]?.loadingRequestId);
  const [addError, setAddError] = useState<string | null>(null);

  const handleAddList = useCallback(() => {
    if (adding) return;
    setAddError(null);
    fetchList(listURL)
      .then(() => {
        dispatch(enableList(listURL));
        onImport();
      })
      .catch((error) => {
        setAddError(error.message);
        dispatch(removeList(listURL));
      });
  }, [adding, dispatch, fetchList, listURL, onImport]);

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5">
          <div className="p-5 rounded-2xl border w-full">
            <div className="flex justify-between">
              <div className="flex">
                {list.logoURI && <ListLogo logoURI={list.logoURI} size="40px" />}
                <div className="gap-2 flex flex-col ml-5">
                  <div className="flex">
                    <p className="font-bold mr-2">{list.name}</p>
                    <div className="h-1 w-1 rounded-full" />
                    <p className="text-sm ml-2">{list.tokens.length} tokens</p>
                  </div>
                  <Link className="text-sm max-w-[90%]" to={`https://tokenlists.org/token-list?url=${listURL}`}>
                    {listURL}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <Message variant="danger">
            <div className="flex flex-col">
              <p className="text-sm text-center mb-4">Import at your own risk</p>
              <p className="text-red-500 mb-2">
                By adding this list you are implicitly trusting that the data is correct. Anyone can create a list,
                including creating fake versions of existing lists and lists that claim to represent projects that do
                not have one.
              </p>
              <p className="text-red-500 font-bold mb-4">
                If you purchase a token from this list, you may not be able to sell it back.
              </p>
              <div className="flex items-center">
                <Checkbox
                  name="confirmed"
                  type="checkbox"
                  checked={confirmed}
                  onChange={() => setConfirmed(!confirmed)}
                  scale="sm"
                />
                <p className="ml-2.5 select-none">I understand</p>
              </div>
            </div>
          </Message>
          <Button disabled={!confirmed} onClick={handleAddList}>
            Import
          </Button>
          {addError ? <p className="text-red-500 overflow-ellipsis overflow-hidden">{addError}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default ImportList;
