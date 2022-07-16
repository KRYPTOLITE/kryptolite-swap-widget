import BigNumber from "bignumber.js";
import { DEFAULT_GAS_LIMIT, DEFAULT_TOKEN_DECIMAL } from "../../config";
import { Contract } from "@ethersproject/contracts";
import getGasPrice from "../../utils/getGasPrice";
import { callWithEstimateGas } from "./estimateGas";

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
};

export const stakeFarm = async (contract: Contract, amount: string) => {
  const gasPrice = getGasPrice();
  const value = new BigNumber(amount)
    .times(DEFAULT_TOKEN_DECIMAL)
    .toFixed()
    .toString();

  const tx = await contract.stake(value, { ...options, gasPrice });
  const receipt = await tx.wait();
  return receipt.status;
};

export const stakeKrlPool2Farm = async (contract: Contract, amount: string) => {
  const value = new BigNumber(amount)
    .times(DEFAULT_TOKEN_DECIMAL)
    .toFixed()
    .toString();
  const tx = await callWithEstimateGas(contract, "deposit", [value]);
  const receipt = await tx.wait();
  return receipt.status;
};

export const unstakeFarm = async (contract: Contract, amount: string) => {
  const gasPrice = getGasPrice();

  const value = new BigNumber(amount)
    .times(DEFAULT_TOKEN_DECIMAL)
    .toFixed()
    .toString();

  const tx = await contract.withdraw(value, { ...options, gasPrice });
  const receipt = await tx.wait();
  return receipt.status;
};

export const unstakeKrlPool2Farm = async (
  contract: Contract,
  amount: string
) => {
  const value = new BigNumber(amount)
    .times(DEFAULT_TOKEN_DECIMAL)
    .toFixed()
    .toString();

  const tx = await callWithEstimateGas(contract, "withdraw", [value]);
  const receipt = await tx.wait();
  return receipt.status;
};

export const harvestFarm = async (contract: Contract) => {
  const tx = await contract.getReward();
  const receipt = await tx.wait();
  return receipt.status;
};

export const harvestKrlPool2Farm = async (contract: Contract) => {
  const tx = await callWithEstimateGas(contract, "deposit", ["0"]);
  const receipt = await tx.wait();
  return receipt.status;
};
