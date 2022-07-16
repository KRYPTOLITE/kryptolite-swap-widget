import * as React from "react";
import Swap from "./views/Swap";
import { Web3ReactProvider } from "@web3-react/core";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { SWRConfig } from "swr";
import ModalProvider from "./components/Modal/ModalContext";
import { Updaters } from "./components/Updaters";
import { RefreshContextProvider } from "./contexts/RefreshContext";
import { ToastsProvider, ToastListener } from "./contexts/ToastContext";
import { fetchStatusMiddleware } from "./hooks/useSWRContract";
import store, { persistor } from "./state";
import { getLibrary } from "./utils/web3React";
import { LocationProvider } from "@reach/router";
import AppWalletProvider from "./contexts/AppContext";
import { usePollBlockNumber } from "./state/block/hooks";

function GlobalHooks() {
  usePollBlockNumber();
  return null;
}

interface AppProps {
  referralAddress: string;
  baseToken: string;
}
export function App(props: AppProps) {
  return (
    <LocationProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Provider store={store}>
          <AppWalletProvider referralAddress={props.referralAddress}>
            <ToastsProvider>
              <ToastListener />
              <SWRConfig
                value={{
                  use: [fetchStatusMiddleware],
                }}
              >
                <RefreshContextProvider>
                  <ModalProvider>
                    <GlobalHooks />
                    <PersistGate loading={null} persistor={persistor}>
                      <Updaters />
                      <Swap baseToken={props.baseToken} />
                    </PersistGate>
                  </ModalProvider>
                </RefreshContextProvider>
              </SWRConfig>
            </ToastsProvider>
          </AppWalletProvider>
        </Provider>
      </Web3ReactProvider>
    </LocationProvider>
  );
}
