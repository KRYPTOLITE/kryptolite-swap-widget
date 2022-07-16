import { InputHTMLAttributes, ReactNode } from "react";

export interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  startIcon?: (isActive?: boolean) => ReactNode;
  endIcon?: (isActive?: boolean) => ReactNode;
}
