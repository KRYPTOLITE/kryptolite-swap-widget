import React from "react";
import Button from "../../Buttons/Button";
import { ButtonProps, PolymorphicComponent } from "../../Buttons/types";

import { ButtonMenuItemProps } from "./types";

const InactiveButton: PolymorphicComponent<ButtonProps, "button"> = (props) => <Button {...props} />;

const ButtonMenuItem: PolymorphicComponent<ButtonMenuItemProps, "button"> = ({
  isActive = false,
  as,
  ...props
}: ButtonMenuItemProps) => {
  if (!isActive) {
    return <InactiveButton {...props} />;
  }

  return <Button as={as} {...props} />;
};

export default ButtonMenuItem;
