import React from "react";

const ModalActions: React.FC = ({ children }) => {
  const l = React.Children.toArray(children).length;
  return (
    <div className="flex items-center my-2 py-2">
      {React.Children.map(children, (child, i) => (
        <>
          <div className="flex-1">{child}</div>
          {i < l - 1 && <div className="w-4" />}
        </>
      ))}
    </div>
  );
};

export default ModalActions;
