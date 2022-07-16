import { ethers } from "ethers";
import type { PageProps as GatsbyPageProps } from "gatsby";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  active?: boolean;
  children?: React.ReactNode;
}

export interface LocationState {
  source?: string;
}

export type PagePropsLocation = GatsbyPageProps<object, object, LocationState>;

export interface TokensBalance {
  name: "tteb" | "lambo";
  address: string;
}

export type CallSignerType = ethers.Signer | ethers.providers.Provider;