import { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa"; // Replace with your preferred arrow icon

const PhoneNumberField = ({
  id,
  name,
  placeholder,
  defaultValue = "",
  onChange,
}) => {
  const [selectedCode, setSelectedCode] = useState("+961");
  const [selectedFlag, setSelectedFlag] = useState("");
  const [countries, setCountries] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        const countryData = data
          .filter((country) => country.idd?.root)
          .map((country) => ({
            code: `${country.idd.root}${country.idd.suffixes?.[0] || ""}`,
            flag: country.flags?.png || "",
            name: country.name.common,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
        setCountries(countryData);

        // Set default flag
        const defaultCountry = countryData.find(
          (country) => country.code === "+961"
        );
        if (defaultCountry) {
          setSelectedFlag(defaultCountry.flag);
        }
      } catch (error) {
        console.error("Failed to fetch country codes:", error);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryCodeChange = (code, flag) => {
    setSelectedCode(code);
    setSelectedFlag(flag);
    setDropdownOpen(false);

    if (onChange) {
      onChange({
        target: {
          name: `${name}-code`,
          value: code,
        },
      });
    }
  };

  return (
    <div className="relative">
      {/* Selected Dropdown */}
      <div
        className="flex items-center border border-gray-300 rounded-xl px-5 py-3 bg-white cursor-pointer"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {/* Flag */}
        {selectedFlag && (
          <img
            src={selectedFlag}
            alt="Selected Country Flag"
            className="w-6 h-4 mr-2"
          />
        )}
        {/* Code */}
        <span className="text-gray-700">{selectedCode}</span>
        {/* Icon */}
        <span className="ml-auto text-gray-500">
          <FaChevronDown className="h-6 w-6 hover:bg-slate-100 transition-all hover:rounded-xl p-1 text-primaryColor cursor-pointer" />
        </span>
      </div>

      {/* Dropdown Options */}
      {dropdownOpen && (
        <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-md z-10 max-h-60 overflow-y-auto">
          {countries.map((country) => (
            <div
              key={country.code}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() =>
                handleCountryCodeChange(country.code, country.flag)
              }
            >
              {/* Flag */}
              {country.flag && (
                <img
                  src={country.flag}
                  alt={`${country.name} Flag`}
                  className="w-6 h-4 mr-2"
                />
              )}
              {/* Code */}
              <span>{country.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhoneNumberField;
