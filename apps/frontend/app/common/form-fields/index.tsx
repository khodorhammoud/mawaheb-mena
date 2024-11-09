import PropTypes from "prop-types";
import { useState } from "react";

const AppFormField = ({
  type = "text",
  id,
  name,
  label,
  placeholder = "",
  options = [],
  className = "", // Custom classes for the entire component
  showPasswordHint = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {type === "select" ? (
        <select
          id={id}
          name={name}
          className={`peer mt-1 block w-40 sm:w-44 md:w-44 lg:w-52 xl:w-72 px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor xl:text-lg lg:text-md`}
        >
          <option value="" disabled selected hidden>
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type === "password" && showPassword ? "text" : type}
          id={id}
          name={name}
          placeholder=" " // Hidden placeholder for styling
          className={`peer mt-1 block w-40 sm:w-44 md:w-44 lg:w-52 xl:w-72 lg:ml-0 px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor xl:text-lg lg:text-md ${type === "password" ? "pr-12" : ""}`}
        />
      )}
      <label
        htmlFor={id}
        className="pr-1 absolute md:left-4 top-3 text-gray-500 bg-white md:px-1 transition-all md:peer-placeholder-shown:top-1/2 peer-placeholder-shown:top-7 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500 xl:peer-placeholder-shown:text-base transform -translate-y-3 peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:bg-white md:peer-focus:px-1 peer-placeholder-shown:text-xs md:peer-placeholder-shown:text-sm lg:ml-0 sm:peer-placeholder-shown:text-sm"
      >
        {label}
      </label>
      {type === "password" && showPasswordHint && (
        <p className="text-xs text-gray-600 mt-3 mb-6 ml-4">
          Password must be 8 characters, upper capital, lower case, symbols
        </p>
      )}
    </div>
  );
};

AppFormField.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  showPasswordHint: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  className: PropTypes.string,
  placeholderTextSize: PropTypes.string, // Prop type for custom placeholder text size
};

export default AppFormField;
