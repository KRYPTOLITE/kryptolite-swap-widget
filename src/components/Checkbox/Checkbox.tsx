import React from "react";
import { CheckboxProps, scales } from "./types";
import cls from "classnames";

const getScale = ({ scale }: CheckboxProps) => {
  switch (scale) {
    case scales.SM:
      return "24px";
    case scales.MD:
    default:
      return "32px";
  }
};

export default function Checkbox({ scale = scales.MD, ...rest }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      {...rest}
      className={cls(
        "appearance-none overflow-hidden cursor-pointer relative inline-block align-middle shadow-md",
        "transition-colors duration-200 ease-in-out border-0 rounded-lg bg-gray-400 custom_checkbox",
      )}
      style={{ height: getScale({ scale }), width: getScale({ scale }) }}
    />
  );
}
