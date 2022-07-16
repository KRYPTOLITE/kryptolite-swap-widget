import React, { Fragment, memo } from "react";
import ChevronRightIcon from "../../../components/Svg/Icons/ChevronRight";
import { Trade } from "../../../config/entities/trade";
import { unwrappedToken } from "../../../utils/wrappedCurrency";

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
  return (
    <div className="flex flex-wrap w-full justify-end items-center">
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1;
        const currency = unwrappedToken(token);
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            <div className="flex items-end">
              <p className="text-sm mx-0.5">{currency.symbol}</p>
            </div>
            {!isLastItem && <ChevronRightIcon width="12px" />}
          </Fragment>
        );
      })}
    </div>
  );
});
