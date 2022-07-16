import React from "react";
import cls from "classnames";

export default function Section({
  padding = false,
  className,
  children,
  containerClass,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  containerClass?: string;
  padding?: boolean;
  id?: string;
}) {
  const pClass = padding ? "py-20" : "pt-0 py-0";
  return (
    <div className={cls(containerClass)} {...props}>
      <div
        className={cls(
          "px-4 md:px-8 max-w-screen-lg mx-auto",
          pClass,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
