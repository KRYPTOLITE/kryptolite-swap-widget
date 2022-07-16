import React, { Fragment } from "react";
import type { ToggleProps } from "./types";

const Toggle: React.FC<ToggleProps> = ({ checked, startIcon, endIcon, ...props }) => {
  return (
    <div
      className="inline-flex items-center rounded-md cursor-pointer h-5 w-5 relative transition-colors
        duration-200"
    >
      <input checked={checked} type="checkbox" {...props} />
      {startIcon && endIcon ? (
        <Fragment>
          <div className="rounded-full cursor-pointer h-5 w-5 left-0.5 absolute top-0.5 z-[1]">
            <div className="h-full flex items-center justify-center">
              {checked ? endIcon(checked) : startIcon(!checked)}
            </div>
          </div>
          <div className="flex w-full h-full justify-around items-center">
            {startIcon()}
            {endIcon()}
          </div>
        </Fragment>
      ) : (
        <div className="rounded-full cursor-pointer h-5 w-5 left-0.5 absolute top-0.5 z-[1]" />
      )}
    </div>
  );
};

export default Toggle;
