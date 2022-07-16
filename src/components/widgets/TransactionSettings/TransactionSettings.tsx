import React, { useState } from "react";
import { useUserSlippageTolerance } from "../../../state/user/hooks";
import { escapeRegExp } from "../../../utils";
import Button from "../../Buttons/Button";
import { Input } from "../../Input";
import QuestionHelper from "../QuestionHelper";

enum SlippageError {
  InvalidInput = "InvalidInput",
  RiskyLow = "RiskyLow",
  RiskyHigh = "RiskyHigh",
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

const SlippageTabs = () => {
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippageTolerance();
  const [slippageInput, setSlippageInput] = useState("");

  const slippageInputIsValid =
    slippageInput === "" || (userSlippageTolerance / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2);

  let slippageError: SlippageError | undefined;
  if (slippageInput !== "" && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput;
  } else if (slippageInputIsValid && userSlippageTolerance < 50) {
    slippageError = SlippageError.RiskyLow;
  } else if (slippageInputIsValid && userSlippageTolerance > 500) {
    slippageError = SlippageError.RiskyHigh;
  } else {
    slippageError = undefined;
  }

  const parseCustomSlippage = (value: string) => {
    if (value === "" || inputRegex.test(escapeRegExp(value))) {
      setSlippageInput(value);

      try {
        const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString());
        if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
          setUserSlippageTolerance(valueAsIntFromRoundedFloat);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col mb-4">
        <div className="flex items-center gap-1 mb-2 justify-center">
          <p className="text-sm">Slippage Tolerance</p>
          <QuestionHelper
            text="Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution."
            placement="top-start"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center">
          <Button
            className="text-sm mr-2 px-2 py-1"
            onClick={() => {
              setSlippageInput("");
              setUserSlippageTolerance(10);
            }}
            variant={userSlippageTolerance === 10 ? "primary" : "outline"}
          >
            0.1%
          </Button>
          <Button
            className="text-sm mr-2 px-2 py-1"
            onClick={() => {
              setSlippageInput("");
              setUserSlippageTolerance(50);
            }}
            variant={userSlippageTolerance === 50 ? "primary" : "outline"}
          >
            0.5%
          </Button>
          <Button
            className="text-sm mr-2 px-2 py-1"
            onClick={() => {
              setSlippageInput("");
              setUserSlippageTolerance(100);
            }}
            variant={userSlippageTolerance === 100 ? "primary" : "outline"}
          >
            1.0%
          </Button>
          <div className="flex items-center mt-1">
            <div className="w-[76px]">
              <Input
                scale="sm"
                inputMode="decimal"
                pattern="^[0-9]*[.,]?[0-9]{0,2}$"
                placeholder={(userSlippageTolerance / 100).toFixed(2)}
                value={slippageInput}
                onBlur={() => {
                  parseCustomSlippage((userSlippageTolerance / 100).toFixed(2));
                }}
                onChange={(event) => {
                  if (event.currentTarget.validity.valid) {
                    parseCustomSlippage(event.target.value.replace(/,/g, "."));
                  }
                }}
                isWarning={!slippageInputIsValid}
                isSuccess={![10, 50, 100].includes(userSlippageTolerance)}
              />
            </div>
            <p className="text-primary bold ml-1">%</p>
          </div>
        </div>
        {!!slippageError && (
          <p
            className="text-sm mt-1 text-center"
            style={{ color: slippageError === SlippageError.InvalidInput ? "red" : "#F3841E" }}
          >
            {slippageError === SlippageError.InvalidInput
              ? "Enter a valid slippage percentage"
              : slippageError === SlippageError.RiskyLow
              ? "Your transaction may fail"
              : "Your transaction may be frontrun"}
          </p>
        )}
      </div>
    </div>
  );
};

export default SlippageTabs;
