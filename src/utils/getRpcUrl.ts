if (process.env.NODE_ENV !== "production" && !process.env.REACT_APP_NODE_1) {
  throw Error("One base RPC URL is undefined");
}

// available nodes to connect to
export const node = process.env.REACT_APP_NODE_1!;

const getNodeUrl = () => {
  // Use custom node if available (both for development and production)
  // However on the testnet it wouldn't work, so if on testnet - comment out the REACT_APP_NODE_PRODUCTION from env file
  if (process.env.REACT_APP_NODE_PRODUCTION) {
    return process.env.REACT_APP_NODE_PRODUCTION;
  }
  return node;
};

export default getNodeUrl;
