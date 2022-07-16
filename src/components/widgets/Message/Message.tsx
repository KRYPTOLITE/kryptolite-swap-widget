import React, { useContext } from "react";
import { WarningIcon, ErrorIcon, CheckmarkCircleFillIcon } from "../../Svg";
import { MessageProps } from "./types";
import cls from "classnames";

const MessageContext = React.createContext<MessageProps>({ variant: "success" });

const Icons = {
  warning: WarningIcon,
  danger: ErrorIcon,
  success: CheckmarkCircleFillIcon,
};

const MessageContainer: React.FC<MessageProps> = ({ children, className }) => (
  <div className={cls("flex bg-red-50 p-4 rounded-2xl border gap-2", className)}>{children}</div>
);

const colors = {
  // these color names should be place in the theme once the palette is finalized
  warning: "#D67E0A",
  success: "#129E7D",
  danger: "failure",
};

export const MessageText: React.FC = ({ children }) => {
  const ctx = useContext(MessageContext);
  return (
    <p className="text-sm font-medium" style={{ color: colors[ctx?.variant] }}>
      {children}
    </p>
  );
};

const Message: React.FC<MessageProps> = ({ children, variant, icon, ...props }) => {
  const Icon = Icons[variant];
  return (
    <MessageContext.Provider value={{ variant }}>
      <MessageContainer variant={variant} {...props}>
        <div className="text-xs" style={{ color: colors[variant], fill: colors[variant] }}>
          {icon ?? <Icon width="24px" />}
        </div>
        {children}
      </MessageContainer>
    </MessageContext.Provider>
  );
};

export default Message;
