import PropTypes from 'prop-types';
import { useState, useEffect, ReactNode } from 'react';
import PhoneNumberField from './phoneNbs/PhoneNumberField';

// Define TypeScript interface for props
interface AppFormFieldProps {
  type?: string;
  id: string;
  name: string;
  label?: ReactNode;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  className?: string;
  showPasswordHint?: boolean;
  col?: number;
  defaultValue?: string | number;
  onChange?: any;
  min?: number;
}

const AppFormField = ({
  type = 'text',
  id,
  name,
  label = '',
  placeholder = '',
  options = [],
  className = '',
  showPasswordHint = true,
  col = 4,
  defaultValue,
  onChange,
  min,
}: AppFormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const [selectedValue, setSelectedValue] = useState(defaultValue);

  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleNumberChange = event => {
    const { value } = event.target;
    let numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters

    if (min !== undefined && Number(numericValue) < min) {
      numericValue = min.toString(); // ✅ Enforce min value
    }

    setSelectedValue(numericValue); // Update state

    if (onChange) {
      onChange({ target: { id, name, value: numericValue } });
    }
  };

  const handleIncrement = (increment: number) => {
    if (onChange) {
      onChange({
        target: { id, name, value: (selectedValue as number) + increment },
      });
    }
  };

  const textareaHeight = `${col * 1.5}rem`;

  return (
    <div className={`relative w-full ${className}`}>
      {/* INPUTS */}
      {/* INPUTS */}
      {/* INPUTS */}
      {id === 'phoneState' ? (
        <PhoneNumberField
          id={id}
          name={name}
          defaultValue={defaultValue.toString()}
          placeholder={placeholder}
          onChange={onChange}
        />
      ) : (
        <>
          {type === 'select' ? (
            // select input
            <select
              id={id}
              name={name}
              className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none bg-white text-gray-900 autofill-fix`}
              spellCheck="false"
              defaultValue={selectedValue} // Controlled component
              onChange={e => {
                const value = e.target.value;
                setSelectedValue(value); // Update state with selected value
                if (onChange) onChange(value); // Call the provided onChange handler
              }}
            >
              <option value="" disabled hidden></option>
              {options.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : type === 'number' || id === 'number' ? ( // Numeric input for id="number"
            <input
              type="number" // type="tel" is used for better UX on mobile devices
              id={id}
              name={name}
              placeholder={placeholder}
              className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 autofill-fix`}
              autoComplete="on"
              spellCheck="false"
              defaultValue={defaultValue}
              onChange={handleNumberChange} // Custom handler for numeric validation
              min={min} // ✅ Apply the min prop
            />
          ) : type === 'increment' ? (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="flex items-center border border-gray-300 rounded-xl w-full">
                {/* - Button */}
                <button
                  type="button"
                  className="w-16 h-12 flex justify-center items-center text-primaryColor rounded-l-xl border-r text-2xl"
                  style={{ borderRight: 'none' }} // Remove the right border of the - button
                  onClick={() => handleIncrement(-1)}
                >
                  <div className="hover:bg-gray-100 px-2 rounded-full">−</div>
                </button>

                {/* Input Display */}
                <div className="w-full h-12 flex justify-center items-center border-x border-gray-300 text-lg">
                  {selectedValue}
                </div>

                {/* + Button */}
                <button
                  type="button"
                  className="w-16 h-12 flex justify-center items-center text-primaryColor rounded-r-xl text-2xl"
                  style={{ borderLeft: 'none' }} // Remove the left border of the + button
                  onClick={() => handleIncrement(1)}
                >
                  <div className="hover:bg-gray-100 px-2 rounded-full">+</div>
                </button>
              </div>
            </div>
          ) : type === 'textarea' ? (
            // textarea input
            <textarea
              id={id}
              name={name}
              placeholder={placeholder}
              style={{ height: textareaHeight }} // Apply dynamic height style
              className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 autofill-fix resize-none`}
              spellCheck="false"
              defaultValue={defaultValue} // Handle default value for textarea
              onChange={onChange} // Attach `onChange` here
            ></textarea>
          ) : (
            // else inputs
            <input
              type={type === 'password' && showPassword ? 'text' : type}
              id={id}
              name={name}
              placeholder={placeholder}
              className={`peer mt-0 block w-full px-4 md:py-3 py-2 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 pr-6 autofill-fix`}
              autoComplete="on"
              spellCheck="false"
              defaultValue={selectedValue}
              onChange={onChange}
            />
          )}
        </>
      )}

      {/* LABELS */}
      {/* LABELS */}
      {/* LABELS */}
      {type === 'password' ? (
        // password label
        <label
          htmlFor={id}
          className="absolute left-4 top-0 text-gray-500 sm:text-base text-sm bg-white px-1 transition-all transform -translate-y-1/2
              peer-placeholder-shown:top-6 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500
              sm:peer-placeholder-shown:text-base peer-placeholder-shown:text-sm
              peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:px-1
              peer:not(:placeholder-shown):top-0 peer:not(:placeholder-shown):left-4 peer:not(:placeholder-shown):text-primaryColor peer:not(:placeholder-shown):bg-white peer:not(:placeholder-shown):px-1"
        >
          {label}
        </label>
      ) : type === 'textarea' ? (
        // textarea label
        <label
          htmlFor={id}
          className="absolute left-4 top-0 text-gray-500 sm:text-base text-sm bg-white px-1 transition-all transform -translate-y-1/2
              peer-placeholder-shown:top-6 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500
              sm:peer-placeholder-shown:text-base peer-placeholder-shown:text-sm
              peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:px-1
              peer:not(:placeholder-shown):top-0 peer:not(:placeholder-shown):left-4 peer:not(:placeholder-shown):text-primaryColor peer:not(:placeholder-shown):bg-white peer:not(:placeholder-shown):px-1"
        >
          {label}
        </label>
      ) : (
        // else labels
        <label
          htmlFor={id}
          className="absolute left-4 top-0 text-gray-500 sm:text-base text-sm bg-white px-1 transition-all transform -translate-y-2/3 md:-translate-y-1/2
                peer-placeholder-shown:top-6 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500
                sm:peer-placeholder-shown:text-base peer-placeholder-shown:text-sm
                peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:px-1
                peer:not(:placeholder-shown):top-0 peer:not(:placeholder-shown):left-4 peer:not(:placeholder-shown):text-primaryColor peer:not(:placeholder-shown):bg-white peer:not(:placeholder-shown):px-1"
        >
          {label}
        </label>
      )}

      {/* BUTTONS */}
      {/* BUTTONS */}
      {/* BUTTONS */}
      {type === 'password' && (
        // password button
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-3 right-3 flex text-xl text-gray-400 cursor-pointer"
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      )}

      {/* PASSWORD SHOW & HIDE ICONS */}
      {/* PASSWORD SHOW & HIDE ICONS */}
      {/* PASSWORD SHOW & HIDE ICONS */}
      {type === 'password' && showPasswordHint && (
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
  label: PropTypes.node,
  placeholder: PropTypes.string,
  showPasswordHint: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  className: PropTypes.string,
  col: PropTypes.number,
  placeholderTextSize: PropTypes.string,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  useRichText: PropTypes.bool,
  min: PropTypes.number, // ✅ Add min to prop types
};

export default AppFormField;
