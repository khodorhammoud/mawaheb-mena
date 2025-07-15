// import PropTypes from 'prop-types';
import { useState, useEffect, ReactNode, forwardRef } from 'react';
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
  value?: string | number;
  onChange?: any;
  onBlur?: () => void;
  min?: number;
  error?: string; 
  maxLength?: number;
  currency?: string;
  required?: boolean;
}

// ✅ Updated AppFormField to forward ref to input/select elements
const AppFormField = forwardRef<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement,
  AppFormFieldProps
>(
  (
    {
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
      value,
      onChange,
      onBlur,
      min,
      error,
      maxLength,
      currency,
      required,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value !== undefined ? value : defaultValue);

    const [country, setCountry] = useState(defaultValue);

    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      } else {
        setSelectedValue(defaultValue);
      }
    }, [defaultValue, value]);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      let numericValue = value.replace(/\D/g, '');

      if (min !== undefined && Number(numericValue) < min) {
        numericValue = min.toString();
      }

      setSelectedValue(numericValue);

      if (onChange) {
        onChange({
          target: {
            id,
            name,
            value: numericValue,
          },
        });
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
            onChange={onChange}
            className="peer mt-0 flex w-full px-4 md:py-1 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 text-l bg-white text-gray-900 autofill-fix"
            ref={ref as React.Ref<HTMLInputElement>} // ✅ Pass the ref!
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
            className="peer mt-0 flex w-full px-4 md:py-1 border border-gray-300 rounded-xl placeholder-transparent text-l bg-white text-gray-900 autofill-fix"
            ref={ref as React.Ref<HTMLButtonElement>} // 👈 This matches <CountrySelectField />
          />
        ) : (
          <>
            {type === 'select' ? (
              <select
                id={id}
                name={name}
                className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparentfocus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 bg-white text-gray-900 autofill-fix`}
                spellCheck="false"
                defaultValue={selectedValue}
                onChange={e => {
                  const value = e.target.value;
                  setSelectedValue(value);
                  if (onChange) onChange(e);
                }}
                ref={ref as React.Ref<HTMLSelectElement>} // ✅ forward ref to select
                required={required}
              >
                <option value="" disabled hidden></option>
                {options.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : type === 'number' || id === 'number' ? (
currency ? (
                <div className="relative w-full">
                  <span className="absolute left-6 top-[24px] -translate-y-1/2 text-gray-400 text-base pointer-events-none z-10">
                    {currency}
                  </span>
                  <input
                    type="number"
                    id={id}
                    name={name}
                    placeholder=" " // <---- this is CRUCIAL
                    className={`peer mt-0 block w-full pl-10 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 autofill-fix pr-6
                    focus-visible:ring-0
                    focus-visible:outline-none
                    focus:ring-0
                    focus:border-none
                    focus-visible:border-none
                    focus-visible:ring-offset-0 text-l bg-white text-gray-900 autofill-fix pr-6
                    `}
                    autoComplete="on"
                    spellCheck="false"
                    value={value !== undefined ? value : selectedValue}
                    defaultValue={defaultValue}
                    onChange={handleNumberChange}
                    min={min}
                    ref={ref as React.Ref<HTMLInputElement>}
                    onBlur={onBlur}
                  />
                  {/* Label with adjusted left */}
                  <label
                    htmlFor={id}
                    className="absolute left-10 top-0 text-gray-500 sm:text-base text-sm bg-white px-1 transition-all transform
                      -translate-y-2/3 md:-translate-y-1/2
                      peer-placeholder-shown:top-6 peer-placeholder-shown:left-10 peer-placeholder-shown:text-gray-500
                      sm:peer-placeholder-shown:text-base peer-placeholder-shown:text-sm
                      peer-focus:top-0 peer-focus:left-10 peer-focus:text-primaryColor peer-focus:px-1
                      peer-not:placeholder-shown:top-0 peer-not:placeholder-shown:left-10 peer-not:placeholder-shown:text-primaryColor peer-not:placeholder-shown:bg-white peer-not:placeholder-shown:px-1"
                  >
                    {label}
                  </label>
                </div>
              ) : (
                <div className="relative w-full">
                  <input
                    type="number"
                    id={id}
                    name={name}
                    placeholder=" "
                    className={`peer mt-0 block w-full pl-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 autofill-fix pr-6
                    focus-visible:ring-0
                    focus-visible:outline-none
                    focus:ring-0
                    focus:border-none
                    focus-visible:border-none
                    focus-visible:ring-offset-0 text-l bg-white text-gray-900 autofill-fix pr-6
                    `}
                    autoComplete="on"
                    spellCheck="false"
                    value={value !== undefined ? value : selectedValue}
                    defaultValue={defaultValue}
                    onChange={handleNumberChange}
                    min={min}
                    ref={ref as React.Ref<HTMLInputElement>}
                    onBlur={onBlur}
                  />
                  {/* Label with normal left */}
                  <label
                    htmlFor={id}
                    className="absolute left-4 top-0 text-gray-500 sm:text-base text-sm bg-white px-1 transition-all transform
                      -translate-y-2/3 md:-translate-y-1/2
                      peer-placeholder-shown:top-6 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500
                      sm:peer-placeholder-shown:text-base peer-placeholder-shown:text-sm
                      peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:px-1
                      peer-not:placeholder-shown:top-0 peer-not:placeholder-shown:left-4 peer-not:placeholder-shown:text-primaryColor peer-not:placeholder-shown:bg-white peer-not:placeholder-shown:px-1"
                  >
                    {label}
                  </label>
                </div>
              )
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
                className={`peer mt-0 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 text-l bg-white text-gray-900 autofill-fix resize-none`}
                spellCheck="false"
                defaultValue={defaultValue}
                onChange={onChange}
                maxLength={maxLength} // <- add this line!
                ref={ref as React.Ref<HTMLTextAreaElement>} // ✅ forward ref to textarea
                required={required}
              ></textarea>
            ) : (
              <input
                type={type === 'password' && showPassword ? 'text' : type}
                id={id}
                name={name}
                placeholder={placeholder}
                className={`peer mt-0 block w-full px-4 md:py-3 py-2 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 text-l bg-white text-gray-900 pr-12 autofill-fix`}
                autoComplete="off"
                spellCheck="false"
                {...(value !== undefined
                  ? { value: selectedValue }
                  : { defaultValue: selectedValue })}
                onChange={e => {
                  const newValue = e.target.value;
                  if (value === undefined) {
                    setSelectedValue(newValue);
                  }
                  if (onChange) {
                    onChange(e);
                  }
                }}
                defaultValue={defaultValue ?? ''}
                maxLength={maxLength}
                ref={ref as React.Ref<HTMLInputElement>}
                required={required}
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
        ) : type === 'number' ? (
          <label></label>
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
  }
);

export default AppFormField;
