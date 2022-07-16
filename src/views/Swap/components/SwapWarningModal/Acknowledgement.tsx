import React, { Fragment, useState } from "react";
import Button from "../../../../components/Buttons/Button";
import { Checkbox } from "../../../../components/Checkbox";

interface AcknowledgementProps {
  handleContinueClick?: () => void;
}

const Acknowledgement: React.FC<AcknowledgementProps> = ({ handleContinueClick }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <Fragment>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Checkbox
            name="confirmed"
            type="checkbox"
            checked={isConfirmed}
            onChange={() => setIsConfirmed(!isConfirmed)}
            scale="sm"
          />
          <p className="text-xs" style={{ userSelect: "none" }}>
            I understand
          </p>
        </div>
        <Button disabled={!isConfirmed} onClick={handleContinueClick}>
          Continue
        </Button>
      </div>
    </Fragment>
  );
};

export default Acknowledgement;
