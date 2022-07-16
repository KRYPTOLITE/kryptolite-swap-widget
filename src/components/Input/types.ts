import React, { ReactElement } from "react";

export const scales = {
  SM: "sm",
  MD: "md",
  LG: "lg",
} as const;

export type Scales = typeof scales[keyof typeof scales];

export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  scale?: Scales;
  isSuccess?: boolean;
  isWarning?: boolean;
}

export interface InputGroupProps extends React.HTMLProps<HTMLInputElement> {
  scale?: Scales;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  children: JSX.Element;
}
