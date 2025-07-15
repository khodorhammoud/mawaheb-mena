import { useEffect, useRef, useState, forwardRef } from 'react';
import { Country } from '@mawaheb/db/enums';
import { ComboBox } from '~/components/ui/combobox';
import { COUNTRY_FLAGS } from '@mawaheb/db/types/country-meta';

const COUNTRIES = Object.entries(Country).map(([code, name]) => ({
  code,
  name,
  flag: COUNTRY_FLAGS[name] || '',
}));

interface CountrySelectFieldProps {
  id: string;
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: any) => void;
  className?: string;
  autoFocus?: boolean;
}

// ✅ Wrap component with forwardRef
const CountrySelectField = forwardRef<HTMLButtonElement, CountrySelectFieldProps>(
  ({ id, name, value, defaultValue, onChange, className = 'w-full', autoFocus = false }, ref) => {
    const [selected, setSelected] = useState(
      COUNTRIES.find(c =>
        value ? c.name === value : defaultValue ? c.name === defaultValue : false
      )?.name || ''
    );

    const buttonRef = useRef<HTMLButtonElement>(null);

    // ✅ Attach internal ref to external forwarded ref
    useEffect(() => {
      if (ref && typeof ref === 'object' && ref !== null) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = buttonRef.current;
      }
    }, [ref]);

    function handleSelect(val: string) {
      setSelected(val);
      const match = COUNTRIES.find(c => c.name === val);
      onChange?.({ target: { id, name, value: match?.name || '' } });
    }

    useEffect(() => {
      if (autoFocus && buttonRef.current) {
        buttonRef.current.click(); // ✅ open dropdown on mount
      }
    }, [autoFocus]);

    return (
      <div className={className}>
        <ComboBox
          options={COUNTRIES.map(c => ({
            value: c.name,
            label: (
              <span className="flex items-center gap-2">
                {c.flag && <img src={c.flag} alt="" className="w-5 h-4" />}
                {c.name}
              </span>
            ),
          }))}
          value={selected}
          onChange={handleSelect}
          placeholder="Select Country"
          className="border-none hover:bg-transparent w-full "
          ref={buttonRef} // ✅ this is the internal ref
        />
        <input type="hidden" id={id} name={name} value={selected || ''} readOnly />
      </div>
    );
  }
);

export default CountrySelectField;
