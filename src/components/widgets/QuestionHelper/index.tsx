import React from "react";
import { Placement, useTooltip } from "../../../hooks/useTooltip";
import HelpIcon from "../../Svg/Icons/Help";

interface Props {
  text: string | React.ReactNode;
  placement?: Placement;
  size?: string;
}

const QuestionHelper: React.FC<Props> = ({ text, placement = "right-end", size = "16px", ...props }) => {
  const { targetRef, tooltip, tooltipVisible } = useTooltip(text, { placement, trigger: "hover" });

  return (
    <div {...props}>
      {tooltipVisible && tooltip}
      <div className="hover:opacity-70 focus:opacity-70" ref={targetRef}>
        <HelpIcon className="text-gray-400" width={size} />
      </div>
    </div>
  );
};

export default QuestionHelper;
