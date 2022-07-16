import React from "react";
import cls from "classnames";

interface RowProps {
  children: React.ReactNode;
  className?: string;
}

export default function Row({ children, className }: RowProps) {
  return <div className={cls("flex items-center justify-start p-0 w-full", className)}>{children}</div>;
}
