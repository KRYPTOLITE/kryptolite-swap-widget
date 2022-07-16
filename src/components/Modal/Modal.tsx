import React from "react";
import { BiArrowBack } from "react-icons/bi";
import { RiCloseLine } from "react-icons/ri";
import { ModalProps } from "./types";
import cls from "classnames";

const Modal: React.FC<ModalProps> = ({
  title,
  onDismiss,
  onBack,
  children,
  hideCloseButton = false,
  bodyPadding = "24px",
  headerBackground = "transparent",
  minWidth = "320px",
  ...props
}) => {
  return (
    <div
      className="w-auto max-w-full overflow-hidden shadow-md border rounded-3xl sm:w-full max-h-screen z-50"
      {...props}
    >
      <div className="flex items-center bg-transparent border-b py-3 px-6">
        <div className="flex items-center flex-1">
          {onBack && <ModalBackButton onBack={onBack} />}
          <h2>{title}</h2>
        </div>
        {!hideCloseButton && <ModalCloseButton onDismiss={onDismiss} />}
      </div>
      <div className="flex flex-col max-h-[90vh] overflow-y-auto">{children}</div>
    </div>
  );
};

export const ModalBackButton: React.FC<{ onBack: ModalProps["onBack"] }> = ({ onBack }) => {
  return (
    <span
      onClick={onBack}
      area-label="go back"
      className="p-1 bg-primary-50 inline-block rounded-full hover:bg-primary-100 cursor-pointer flex-none"
    >
      <BiArrowBack className="h-7 w-7" />
    </span>
  );
};

export const ModalCloseButton: React.FC<{ onDismiss: ModalProps["onDismiss"] }> = ({ onDismiss }) => {
  return (
    <span
      onClick={onDismiss}
      aria-label="Close the dialog"
      className="p-1 bg-primary-50 inline-block rounded-full hover:bg-primary-100 cursor-pointer flex-none"
    >
      <RiCloseLine className="h-8 w-8" />
    </span>
  );
};

export const ModalHeader: React.FC = ({ children }) => (
  <div className="flex items-center border-b py-2 px-6">{children}</div>
);
export const ModalTitle: React.FC = ({ children }) => (
  <h2 className="flex items-center w-full text-lg !mb-0">{children}</h2>
);

export const ModalBody: React.FC<{ className?: string }> = ({ children, className }) => (
  <div className={cls("flex flex-col w-full max-h-[90vh] p-6 overflow-y-auto", className)}>{children}</div>
);

export const ModalContainer: React.FC<{ className?: string }> = ({ children, className }) => {
  return (
    <div
      className={cls(
        "overflow-hidden shadow-lg border max-h-screen z-[999] relative bg-white max-w-lg mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Modal;
