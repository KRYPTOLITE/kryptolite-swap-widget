import { networkList } from "../config/constants";
import { RecognizedChainId } from "../config/constants/types";

export const detectNetwork = (
  networkId: number
): { url: string; name: string } => {
  const network = networkList[networkId as RecognizedChainId];
  if (network) {
    return network;
  } else {
    return { url: "", name: `Unknown network ID=${networkId}` };
  }
};
