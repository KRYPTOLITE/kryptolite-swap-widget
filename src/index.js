import * as React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { isAddress } from "./utils";

// Find all widget divs
const app = document.getElementById("kryptolite-swap-widget");
const root = createRoot(app);
const refAddress = app?.dataset.referraladdress;
const baseToken = app?.dataset.basetoken;

if (isAddress(refAddress) === false || isAddress(baseToken) === false) {
  console.error("You have entered an invalid referralAddress or baseToken address");
  root.render(
    <React.StrictMode>
      <div className="text-gray-500 border p-10">Provide valid configuration for the widget.</div>
    </React.StrictMode>,
  );
} else {
  root.render(
    <React.StrictMode>
      {/* Address are defined and valid */}
      <App referralAddress={refAddress} baseToken={baseToken} />
    </React.StrictMode>,
  );
}
