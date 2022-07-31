// import { ChainId } from "config/constants";
import { addresses, ChainId } from "../config/constants";
import { Address } from "../config/constants/types";

export const getAddress = (address: Address): string => {
  const chainId = process.env.REACT_APP_CHAIN_ID as unknown as keyof Address;
  return (address[chainId] ? address[chainId] : address[ChainId.MAINNET])!;
};

export const getKrlAddress = () => getAddress(addresses.kryptolite);
export const getMulticallAddress = () => getAddress(addresses.multiCall);
