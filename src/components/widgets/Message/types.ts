import React from "react";

export const variants = {
  WARNING: "warning",
  DANGER: "danger",
  SUCCESS: "success",
} as const;

export type Variant = typeof variants[keyof typeof variants];

export interface MessageProps {
  variant: Variant;
  icon?: React.ReactNode;
  className?: string;
}
