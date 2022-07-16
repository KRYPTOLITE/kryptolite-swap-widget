import React from "react";
import cls from "classnames";

export default function Skeleton({ className }: { className?: string }) {
  return <div className={cls("bg-gray-50 animate-pulse w-full h-6", className)} />;
}
