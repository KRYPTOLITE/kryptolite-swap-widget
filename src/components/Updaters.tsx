import React, { Fragment } from "react";
import MulticallUpdater from "../state/multicall/updater";
import ListUpdater from "../state/lists/updater";
// import TransactionUpdater from "../state/transactions/updater";

export function Updaters() {
  return (
    <Fragment>
      <ListUpdater />
      {/* <TransactionUpdater /> */}
      <MulticallUpdater />
    </Fragment>
  );
}
