import React from "react";
import type { ButtonProps } from "./types";
import cls from "classnames";
import { RiLoader3Line } from "react-icons/ri";

export default function Button({ className, variant = "primary", loading = false, children, ...props }: ButtonProps) {
  let variantClass = "";

  switch (variant) {
    case "primary":
      variantClass = "btn-primary";
      break;
    case "outline":
      variantClass = "btn-outline";
      break;
    case "danger":
      variantClass = "btn-danger";
      break;
    default:
      throw new Error("invalid variant type supplied");
  }

  return (
    <button className={cls("btn", variantClass, className)} {...props}>
      {loading && <RiLoader3Line className="animate-spin !w-4 !h-4 inline-block mr-1" />}
      {children}
    </button>
  );
}
