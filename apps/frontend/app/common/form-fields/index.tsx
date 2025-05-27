// import PropTypes from 'prop-types';
import { useState, useEffect, ReactNode } from 'react';
import PhoneNumberField from './phoneNbs/PhoneNumberField';
import CountrySelectField from './counrtiesDropdown/CountrySelectField';

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
  error?: string; // ✅ Added error support
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
  error,
}: AppFormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const [country, setCountry] = useState(defaultValue);

  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleNumberChange = event => {
    const { value } = event.target;
    let numericValue = value.replace(/\D/g, '');

    if (min !== undefined && Number(numericValue) < min) {
      numericValue = min.toString();
    }

    setSelectedValue(numericValue);

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
      {id === 'phoneState' ? (
        <PhoneNumberField
          id={id}
          name={name}
          defaultValue={defaultValue.toString()}
          placeholder={placeholder}
          onChange={onChange}
        />
      ) : id === 'countryDropdown' ? (
        <CountrySelectField
          id={id}
          name={name}
          defaultValue={String(defaultValue ?? selectedValue)}
          onChange={e => {
            setSelectedValue(e.target.value);
            if (onChange) onChange(e);
          }}
          className={className}
        />
      ) : (
        <>
          {type === 'select' ? (
            <select
              id={id}
              name={name}
              className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none bg-white text-gray-900 autofill-fix`}
              spellCheck="false"
              defaultValue={selectedValue}
              onChange={e => {
                const value = e.target.value;
                setSelectedValue(value);
                if (onChange) onChange(value);
              }}
            >
              <option value="" disabled hidden></option>
              {options.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : type === 'number' || id === 'number' ? (
            <input
              type="number"
              id={id}
              name={name}
              placeholder={placeholder}
              className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 autofill-fix`}
              autoComplete="on"
              spellCheck="false"
              defaultValue={defaultValue}
              onChange={handleNumberChange}
              min={min}
            />
          ) : type === 'increment' ? (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="flex items-center border border-gray-300 rounded-xl w-full">
                <button
                  type="button"
                  className="w-16 h-12 flex justify-center items-center text-primaryColor rounded-l-xl border-r text-2xl"
                  style={{ borderRight: 'none' }}
                  onClick={() => handleIncrement(-1)}
                >
                  <div className="hover:bg-gray-100 px-2 rounded-full">−</div>
                </button>
                <div className="w-full h-12 flex justify-center items-center border-x border-gray-300 text-lg">
                  {selectedValue}
                </div>
                <button
                  type="button"
                  className="w-16 h-12 flex justify-center items-center text-primaryColor rounded-r-xl text-2xl"
                  style={{ borderLeft: 'none' }}
                  onClick={() => handleIncrement(1)}
                >
                  <div className="hover:bg-gray-100 px-2 rounded-full">+</div>
                </button>
              </div>
            </div>
          ) : type === 'textarea' ? (
            <textarea
              id={id}
              name={name}
              placeholder={placeholder}
              style={{ height: textareaHeight }}
              className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 autofill-fix resize-none`}
              spellCheck="false"
              defaultValue={defaultValue}
              onChange={onChange}
            ></textarea>
          ) : (
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
      {type === 'password' ? (
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
      {type === 'password' && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-3 right-3 flex text-xl text-gray-400 cursor-pointer"
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      )}

      {/* ✅ ERROR MESSAGE */}
      {error && <p className="ml-1 mt-2 text-sm text-red-600 font-medium">{error}</p>}

      {type === 'password' && showPasswordHint && (
        <p className={`text-xs text-gray-600 mt-1 ${error ? 'ml-1' : 'ml-4'}`}>
          Password must be 8 characters, upper capital, lower case, symbols
        </p>
      )}
    </div>
  );
};

export default AppFormField;
