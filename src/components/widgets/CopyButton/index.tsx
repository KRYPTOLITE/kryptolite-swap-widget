import React, { useState } from "react";
import cls from "classnames";
import { SvgProps } from "../../Svg/types";
import CopyIcon from "../../Svg/Icons/Copy";
import { copyText } from "../../../utils";

const Tooltip: React.FC<{
  isTooltipDisplayed: boolean;
  tooltipTop: number;
  tooltipRight?: number;
  tooltipFontSize?: number;
}> = ({ isTooltipDisplayed, tooltipRight, tooltipTop, tooltipFontSize, children }) => {
  return (
    <div
      style={{
        top: `${tooltipTop}px`,
        right: tooltipRight ? `${tooltipRight}px` : 0,
        fontSize: `${tooltipFontSize}px` ?? "100%",
      }}
      className={cls(
        { inline: isTooltipDisplayed, hidden: !isTooltipDisplayed },
        "absolute p-2 text-center rounded-2xl opacity-70",
      )}
    >
      {children}
    </div>
  );
};

interface CopyButtonProps extends SvgProps {
  text: string;
  tooltipMessage: string;
  tooltipTop: number;
  tooltipRight?: number;
  tooltipFontSize?: number;
  buttonColor?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  tooltipMessage,
  width,
  tooltipTop,
  tooltipRight,
  tooltipFontSize,
  buttonColor = "primary",
  ...props
}) => {
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false);

  const displayTooltip = () => {
    setIsTooltipDisplayed(true);
    setTimeout(() => {
      setIsTooltipDisplayed(false);
    }, 1000);
  };
  return (
    <>
      <CopyIcon
        style={{ cursor: "pointer" }}
        color={buttonColor}
        width={width}
        onClick={() => copyText(text, displayTooltip)}
        {...props}
      />
      <Tooltip
        isTooltipDisplayed={isTooltipDisplayed}
        tooltipTop={tooltipTop}
        tooltipRight={tooltipRight}
        tooltipFontSize={tooltipFontSize}
      >
        {tooltipMessage}
      </Tooltip>
    </>
  );
};
