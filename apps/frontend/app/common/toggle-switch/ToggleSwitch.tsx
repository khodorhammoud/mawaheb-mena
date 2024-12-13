import { useState } from "react";

const ToggleSwitch = ({ isChecked = false, onChange, className = "" }) => {
  const [checked, setChecked] = useState(isChecked);

  const handleToggle = () => {
    setChecked(!checked);
    if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`sm:w-11 sm:h-6 w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer select-none ${
        checked ? "bg-primaryColor" : ""
      } ${className}`}
    >
      <div
        className={`bg-white sm:w-4 sm:h-4 h-3 w-3 rounded-full shadow-md transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      ></div>
    </div>
  );
};

export default ToggleSwitch;
