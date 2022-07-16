import React from "react";
import useHttpLocations from "../../hooks/useHttpLocations";
import Logo from "./";

export default function ListLogo({
  logoURI,
  style,
  alt,
  size = "24px",
}: {
  logoURI: string;
  size?: string;
  style?: React.CSSProperties;
  alt?: string;
}) {
  const srcs: string[] = useHttpLocations(logoURI);

  return <Logo alt={alt} width={size} height={size} srcs={srcs} style={style} />;
}
