import React from "react";
import { parseUnits } from "ethers/lib/utils";
import { formatBigNumber } from "../../utils/formatBalance";
import Button from "../Buttons/Button";

interface ModalInputProps {
  max: string;
  symbol: string;
  onSelectMax?: () => void;
  onChange: (e: React.FormEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value: string;
  addLiquidityUrl?: string;
  inputTitle?: string;
  decimals?: number;
}

const ModalInput = ({
  max,
  symbol,
  onChange,
  onSelectMax,
  value,
  addLiquidityUrl,
  inputTitle,
  decimals = 18,
}: ModalInputProps) => {
  const isBalanceZero = max === "0" || !max;

  const displayBalance = (balance: string) => {
    if (isBalanceZero) {
      return "0";
    }

    const balanceUnits = parseUnits(balance, decimals);
    return formatBigNumber(balanceUnits, decimals, decimals);
  };

  return (
    <div className="relative">
      <div className={`flex flex-col rounded-lg shadow p-2 w-full ${isBalanceZero ? "text-red-600" : ""}`}>
        <div className="flex mb-2">
          <p>{inputTitle}</p>
          <p>Balance: {displayBalance(max)}</p>
        </div>
        <div className="flex flex-col space-y-3">
          <input
            pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
            inputMode="decimal"
            step="any"
            min="0"
            onChange={onChange}
            placeholder="0"
            value={value}
            className="p-1 text-gray-900 outline-none ring ring-gray-200 rounded
            focus:ring-primary-600"
          />
          <Button className="block" onClick={onSelectMax}>
            Max
          </Button>
        </div>
      </div>
      {isBalanceZero && (
        <p className="text-sm text-red-600">
          No tokens to stake{" "}
          <a className="text-xs font-medium text-blue-400 underline" href={addLiquidityUrl} rel="noopener nofollow">
            Click to get {symbol}
          </a>
        </p>
      )}
    </div>
  );
};

export default ModalInput;
