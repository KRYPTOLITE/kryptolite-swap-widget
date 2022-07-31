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
import { useEffect } from "react";

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
    <CollectAnonymousData>
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
    </CollectAnonymousData>
  );
}

const CollectAnonymousData = (props: { children: JSX.Element }) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const { origin } = window.location;
      const serverUrl = process.env.REACT_APP_FRONTEND_URL;
      const url = serverUrl + origin; // us?domain=yourdomain
      // Keep track of projects using our widget
      fetch(url)
        .then(async (_res) => {
          // send a get request to our server
          /*  const [result] = await res.json();
          if (result.status) {
            console.log(result);
          } */
        })
        .catch((_e) => {
          // console.error(e) do nothing
        });
    }
  }, []);

  return props.children;
};
