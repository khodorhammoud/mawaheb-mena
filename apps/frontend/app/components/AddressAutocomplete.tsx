import React, { useState, useEffect, forwardRef } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';

interface AddressAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  label?: string;
  error?: string;
}

const AddressAutocomplete = forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({ value, onChange, name = 'address', label = 'Address', error }, ref) => {
    const [address, setAddress] = useState(value || '');
    const [focused, setFocused] = useState(false);

    useEffect(() => {
      setAddress(value || '');
    }, [value]);

    const handleSelect = (val: string) => {
      setAddress(val);
      onChange && onChange(val);
    };

    return (
      <div className={`relative w-full`}>
        <PlacesAutocomplete
          value={address}
          onChange={setAddress}
          onSelect={handleSelect}
          searchOptions={{
            types: ['address'],
            // componentRestrictions: { country: ['eg', 'lb'] },
          }}
          debounce={250}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <div className="relative">
              {/* INPUT */}
              <input
                {...getInputProps({
                  placeholder: ' ', // Space for floating label
                  name,
                  autoComplete: 'off',
                  ref,
                  onFocus: () => setFocused(true),
                  onBlur: () => setFocused(false),
                })}
                className={`
                  peer mt-0 block w-full px-4 md:py-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'}
                  rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 pr-12 autofill-fix
                `}
              />
              {/* FLOATING LABEL */}
              <label
                htmlFor={name}
                className={`
                  absolute left-4 top-0 text-gray-500 sm:text-base text-sm bg-white px-1 transition-all transform
                  -translate-y-2/3 md:-translate-y-1/2 pointer-events-none
                  peer-placeholder-shown:top-6 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500
                  sm:peer-placeholder-shown:text-base peer-placeholder-shown:text-sm
                  peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:px-1
                  ${address || focused ? 'top-0 left-4 text-primaryColor px-1 bg-white' : ''}
                `}
              >
                {label}
              </label>

              {/* SUGGESTIONS */}
              {suggestions.length > 0 && (
                <div className="absolute z-50 bg-white border w-full rounded-xl shadow-md max-h-60 overflow-auto">
                  {loading && <div className="p-2">Loading...</div>}
                  {suggestions.map(suggestion => (
                    <div
                      {...getSuggestionItemProps(suggestion, {
                        className:
                          'p-2 cursor-pointer hover:bg-gray-100' +
                          (suggestion.active ? ' bg-gray-200' : ''),
                      })}
                      key={suggestion.placeId}
                    >
                      {suggestion.description}
                    </div>
                  ))}
                </div>
              )}

              {/* ERROR */}
              {error && <p className="ml-1 mt-2 text-sm text-red-600 font-medium">{error}</p>}
            </div>
          )}
        </PlacesAutocomplete>
      </div>
    );
  }
);

export default AddressAutocomplete;
