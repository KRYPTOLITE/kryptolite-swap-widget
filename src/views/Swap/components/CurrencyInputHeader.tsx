import React from "react";
import RefreshIcon from "../../../components/Svg/Icons/Refresh";

interface Props {
  title: string;
  subtitle: string;
  noConfig?: boolean;
  isChartDisplayed?: boolean;
  hasAmount: boolean;
  onRefreshPrice: () => void;
}

const CurrencyInputHeader: React.FC<Props> = ({ title, subtitle, hasAmount, onRefreshPrice }) => {
  return (
    <div className="flex flex-col items-center p-6 mb-3 w-full border-b">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-start w-full mr-4">
          <h2 className="text-2xl">{title}</h2>
        </div>
        <div>
          {/* <IconButton onClick={onPresentTransactionsModal} variant="text" scale="sm">
            <HistoryIcon color="textSubtle" width="24px" />
          </IconButton> */}
          <button className="cursor-pointer" onClick={() => onRefreshPrice()} disabled={!hasAmount}>
            <RefreshIcon color="textSubtle" width="27px" />
          </button>
        </div>
      </div>
      <div className="flex items-center text-sm">
        <p>{subtitle}</p>
      </div>
    </div>
  );
};

export default CurrencyInputHeader;
