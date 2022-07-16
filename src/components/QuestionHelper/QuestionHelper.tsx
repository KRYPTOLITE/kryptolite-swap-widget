import React from "react";
import HelpIcon from "../Svg/Icons/Help";

interface Props {
  text: string | React.ReactNode;
}

const QuestionHelper: React.FC<Props> = ({ text }) => {
  return (
    <div>
      <div>{text}</div>
      <div className="hover:opacity-70 focus:opacity-70">
        <HelpIcon color="textSubtle" />
      </div>
    </div>
  );
};

export default QuestionHelper;
