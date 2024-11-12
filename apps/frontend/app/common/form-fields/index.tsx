import PropTypes from "prop-types";
import { useState } from "react";

const AppFormField = ({
  type = "text",
  id,
  name,
  label,
  placeholder = "",
  options = [],
  className = "",
  showPasswordHint = true,
  col = 4,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const textareaHeight = `${col * 1.5}rem`;

  return (
    <div className={`relative w-full ${className}`}>
      {/* INPUTS */}
      {/* INPUTS */}
      {/* INPUTS */}
      {type === "select" ? (
        // select input
        <select
          id={id}
          name={name}
          className="peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor text-base"
        >
          <option value="" disabled selected hidden></option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        // textarea input
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          style={{ height: textareaHeight }} // Apply dynamic height style
          className="peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor text-base resize-none"
        ></textarea>
      ) : (
        // else inputs
        <input
          type={type === "password" && showPassword ? "text" : type}
          id={id}
          name={name}
          placeholder={placeholder}
          className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor text-base ${type === "password" ? "pr-12" : ""}`}
        />
      )}

      {/* LABELS */}
      {/* LABELS */}
      {/* LABELS */}
      {type === "password" ? (
        // password label
        <label
          htmlFor={id}
          className="absolute left-4 top-0 text-gray-500 text-base bg-white px-1 transition-all transform -translate-y-1/2
              peer-placeholder-shown:top-6 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:text-base
              peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:bg-white peer-focus:px-1
              peer:not(:placeholder-shown):top-0 peer:not(:placeholder-shown):left-4 peer:not(:placeholder-shown):text-primaryColor peer:not(:placeholder-shown):bg-white peer:not(:placeholder-shown):px-1"
        >
          Password
        </label>
      ) : type === "textarea" ? (
        // textarea label
        <label
          htmlFor={id}
          className="absolute left-4 top-0 text-gray-500 text-base bg-white px-1 transition-all transform -translate-y-1/2
              peer-placeholder-shown:top-6 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:text-base
              peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:bg-white peer-focus:px-1
              peer:not(:placeholder-shown):top-0 peer:not(:placeholder-shown):left-4 peer:not(:placeholder-shown):text-primaryColor peer:not(:placeholder-shown):bg-white peer:not(:placeholder-shown):px-1"
        >
          {label}
        </label>
      ) : (
        // else labels
        <label
          htmlFor={id}
          className="absolute left-4 top-0 text-gray-500 text-base bg-white px-1 transition-all transform -translate-y-1/2
              peer-placeholder-shown:top-6 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500
              peer-placeholder-shown:text-base
              peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:bg-white peer-focus:px-1
              peer:not(:placeholder-shown):top-0 peer:not(:placeholder-shown):left-4 peer:not(:placeholder-shown):text-primaryColor peer:not(:placeholder-shown):bg-white peer:not(:placeholder-shown):px-1"
        >
          {label}
        </label>
      )}

      {/* BUTTONS */}
      {/* BUTTONS */}
      {/* BUTTONS */}
      {type === "password" && (
        // password button
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-3 right-3 flex text-xl text-gray-400 cursor-pointer"
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      )}

      {/* PASSWORD SHOW & HIDE ICONS */}
      {/* PASSWORD SHOW & HIDE ICONS */}
      {/* PASSWORD SHOW & HIDE ICONS */}
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
  col: PropTypes.number, // New prop for dynamic height of textarea
};

export default AppFormField;
