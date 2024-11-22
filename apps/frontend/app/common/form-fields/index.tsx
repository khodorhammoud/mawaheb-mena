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
  defaultValue = "", // New prop to handle default values
  inputValue = null,
  onChange, // Add the `onChange` prop
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
          className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 pr-12 autofill-fix`}
          spellCheck="false"
          defaultValue={defaultValue} // Handle default value for select
          onChange={onChange} // Attach `onChange` here
        >
          <option value="" disabled selected hidden></option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "number" ? (
        // number input without spinner buttons
        <input
          type="number"
          id={id}
          name={name}
          placeholder={placeholder}
          className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 autofill-fix no-spinner`} // Add no-spinner class here
          autoComplete="on"
          spellCheck="false"
          value={inputValue !== null ? inputValue : undefined}
          defaultValue={defaultValue} // Handle default value for input
          onChange={onChange} // Attach `onChange` here
        />
      ) : type === "textarea" ? (
        // textarea input
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          style={{ height: textareaHeight }} // Apply dynamic height style
          className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 pr-12 autofill-fix resize-none`}
          spellCheck="false"
          value={inputValue !== null ? inputValue : undefined}
          defaultValue={defaultValue} // Handle default value for textarea
          onChange={onChange} // Attach `onChange` here
        ></textarea>
      ) : (
        // else inputs
        <input
          type={type === "password" && showPassword ? "text" : type}
          id={id}
          name={name}
          placeholder={placeholder}
          className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 pr-12 autofill-fix`}
          autoComplete="on"
          spellCheck="false"
          value={inputValue !== null ? inputValue : undefined}
          defaultValue={defaultValue} // Handle default value for input
          onChange={onChange} // Attach `onChange` here
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
              peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:px-1
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
              peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:px-1
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
                peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:px-1
                peer:not(:placeholder-shown):top-0 peer:not(:placeholder-shown):left-4 peer:not(:placeholder-shown):text-primaryColor peer:not(:placeholder-shown):bg-white peer:not(:placeholder-shown):px-1"
        >
          {label}
        </label>
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
  placeholderTextSize: PropTypes.string, // Prop type for custom placeholder text size
  defaultValue: PropTypes.string, // New prop for default values
  inputValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func, // Prop type for `onChange` event
};

export default AppFormField;
