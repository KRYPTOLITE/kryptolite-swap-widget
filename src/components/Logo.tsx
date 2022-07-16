import React from "react";
import Link from "./Link";
const logo = new URL("../images/icon.png", import.meta.url);

export default function Logo() {
  return (
    <Link to="/">
      <img
        //@ts-ignore
        src={logo}
        alt="KRYPTOLITE Logo"
        width={50}
        placeholder="blurred"
      />
    </Link>
  );
}
