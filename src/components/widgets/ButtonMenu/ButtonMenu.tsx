import React, { cloneElement, Children, ReactElement } from "react";
import { ButtonMenuProps } from "./types";
import cls from "classnames";

const ButtonMenu: React.FC<ButtonMenuProps> = ({ activeIndex = 0, onItemClick, disabled, children, ...props }) => {
  return (
    <div className={cls("mb-3 flex w-full gap-5", { "opacity-50": disabled })} {...props}>
      {Children.map(children, (child: ReactElement, index) => {
        return cloneElement(child, {
          isActive: activeIndex === index,
          onClick: onItemClick ? () => onItemClick(index) : undefined,
          disabled,
        });
      })}
    </div>
  );
};

export default ButtonMenu;
