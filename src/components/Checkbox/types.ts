import React from "react";

export const scales = {
  SM: "sm",
  MD: "md",
} as const;

export type Scales = typeof scales[keyof typeof scales];

export interface CheckboxProps extends React.ComponentPropsWithoutRef<"input"> {
  scale?: Scales;
}
