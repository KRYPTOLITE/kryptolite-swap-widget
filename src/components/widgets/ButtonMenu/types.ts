import { ReactElement } from "react";
import { ButtonProps } from "../../Buttons/types";

export interface ButtonMenuItemProps extends ButtonProps {
  isActive?: boolean;
}

export interface ButtonMenuProps {
  activeIndex?: number;
  onItemClick?: (index: number) => void;
  disabled?: boolean;
  children: ReactElement[];
  fullWidth?: boolean;
}
