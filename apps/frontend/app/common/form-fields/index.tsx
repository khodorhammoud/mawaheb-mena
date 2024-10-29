import PropTypes from "prop-types";
import { useState } from "react";

const AppFormField = ({
  type = "text",
  id,
  name,
  label,
  placeholder = "",
  options = [], // For dropdowns
  className = "", // Custom classes if needed
  showPasswordHint = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`relative ${className}`}>
      {type === "select" ? (
        <select
          id={id}
          name={name}
          className="peer mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor text-lg"
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
          placeholder=" "
          className={`peer mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor text-lg ${type === "password" ? "pr-12" : ""}`}
        />
      )}
      {type === "password" ? (
        <label
          htmlFor="password"
          className="absolute left-4 top-0 text-gray-500 text-lg bg-white px-1 transition-all peer-placeholder-shown:top-[25px] peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base transform -translate-y-1/2 peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:bg-white peer-focus:px-1"
        >
          Password
        </label>
      ) : (
        <label
          htmlFor={id}
          className="absolute left-4 top-3 text-gray-500 text-lg bg-white px-1 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base transform -translate-y-3 peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:bg-white peer-focus:px-1"
        >
          {label}
        </label>
      )}
      {type === "password" && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-3 right-3 flex text-xl text-gray-400 cursor-pointer"
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      )}
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
};

export default AppFormField;

// Usage Example
// <FormField type="email" id="email" name="email" label="Email Address" />
// <FormField type="text" id="name" name="name" label="Full Name" />
// <FormField type="select" id="country" name="country" label="Country" options={[{ value: 'us', label: 'United States' }, { value: 'ca', label: 'Canada' }]} placeholder="Select a country" />
