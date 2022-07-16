import React, { forwardRef } from "react";
import { InputProps, scales } from "./types";
import cls from "classnames";

const getHeight = ({ scale = scales.MD }: InputProps) => {
  switch (scale) {
    case scales.SM:
      return "32px";
    case scales.LG:
      return "48px";
    case scales.MD:
    default:
      return "40px";
  }
};

const Input = forwardRef<HTMLInputElement, InputProps>(({ scale, className, isWarning, isSuccess, ...rest }, ref) => {
  return (
    <input
      className={cls(
        `first-letter:rounded-2xl block text-base outline-none py-0 px-4 w-full border border-gray-300
        disabled:cursor-not-allowed rounded-sm`,
        className,
      )}
      style={{ height: getHeight({ scale }) }}
      ref={ref}
      {...rest}
    />
  );
});

export default Input;
