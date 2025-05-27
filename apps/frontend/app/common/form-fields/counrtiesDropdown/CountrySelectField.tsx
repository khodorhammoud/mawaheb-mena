import { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface CountrySelectFieldProps {
  id: string;
  name: string;
  value?: string; // controlled
  defaultValue?: string; // uncontrolled
  onChange?: (e: any) => void;
  className?: string;
}

const CountrySelectField = ({
  id,
  name,
  value,
  defaultValue = '',
  onChange,
  className = '',
}: CountrySelectFieldProps) => {
  const [countries, setCountries] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // For uncontrolled mode only
  const [selectedCountry, setSelectedCountry] = useState<any>(null);

  // 1. Fetch countries once
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all');
        const data = await res.json();
        const sorted = data
          .map((c: any) => ({
            name: c.name.common,
            flag: c.flags?.png,
            code: c.cca2,
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountries(sorted);

        // Set initial country (uncontrolled mode only)
        if (!value && defaultValue) {
          const match = sorted.find(
            (c: any) =>
              c.name.toLowerCase() === defaultValue.toLowerCase() || c.code === defaultValue
          );
          if (match) setSelectedCountry(match);
        }
      } catch (err) {
        console.error('Failed to fetch countries', err);
      }
    };
    fetchCountries();
    // eslint-disable-next-line
  }, []);

  // 2. Keep selectedCountry in sync with value prop (controlled mode)
  useEffect(() => {
    if (value && countries.length > 0) {
      const match = countries.find(
        (c: any) => c.name.toLowerCase() === value.toLowerCase() || c.code === value
      );
      if (match) setSelectedCountry(match);
    }
  }, [value, countries]);

  // 3. Handle selection
  const handleSelect = (country: any) => {
    setDropdownOpen(false);

    // Call parent onChange with country name (or code if you prefer)
    if (onChange) {
      onChange({
        target: { id, name, value: country.name },
      });
    }
    // For uncontrolled: update local state
    if (!value) setSelectedCountry(country);
  };

  // 4. Determine displayed country
  const displayedCountry =
    // controlled mode
    (value &&
      countries.find(
        (c: any) => c.name.toLowerCase() === value.toLowerCase() || c.code === value
      )) ||
    // uncontrolled fallback
    selectedCountry;

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center border border-gray-300 rounded-xl px-5 py-3 bg-white cursor-pointer"
        onClick={() => setDropdownOpen(open => !open)}
        tabIndex={0}
      >
        {displayedCountry?.flag && (
          <img src={displayedCountry.flag} alt="Country Flag" className="w-6 h-4 mr-2" />
        )}
        <span className="text-gray-700 flex-1">{displayedCountry?.name || 'Select Country'}</span>
        <span className="ml-auto text-gray-500">
          <FaChevronDown className="h-6 w-6 hover:bg-slate-100 transition-all hover:rounded-xl p-1 text-primaryColor cursor-pointer -mr-2" />
        </span>
      </div>
      {dropdownOpen && (
        <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-md z-10 max-h-64 overflow-y-auto">
          {countries.map(country => (
            <div
              key={country.code}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(country)}
            >
              {country.flag && (
                <img src={country.flag} alt={`${country.name} Flag`} className="w-6 h-4 mr-2" />
              )}
              <span>{country.name}</span>
            </div>
          ))}
        </div>
      )}
      {/* Hidden input to submit the value */}
      <input type="hidden" id={id} name={name} value={displayedCountry?.name || ''} readOnly />
    </div>
  );
};

export default CountrySelectField;
