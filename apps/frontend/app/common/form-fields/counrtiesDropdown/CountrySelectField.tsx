import { useState } from 'react';
import { Country } from '@mawaheb/db/enums';
import { ComboBox } from '~/components/ui/combobox';
import { COUNTRY_FLAGS } from '@mawaheb/db/types/country-meta';

const COUNTRIES = Object.entries(Country).map(([code, name]) => ({
  code,
  name,
  flag: COUNTRY_FLAGS[name] || '',
}));

export default function CountrySelectField({
  id,
  name,
  value,
  defaultValue,
  onChange,
  className = 'w-full',
}) {
  const [selected, setSelected] = useState(
    COUNTRIES.find(c => (value ? c.name === value : defaultValue ? c.name === defaultValue : false))
      ?.name || ''
  );

  function handleSelect(val: string) {
    setSelected(val);
    const match = COUNTRIES.find(c => c.name === val);
    onChange?.({ target: { id, name, value: match?.name || '' } });
  }

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
        className={'border-none hover:bg-transparent w-full'}
      />
      <input type="hidden" id={id} name={name} value={selected || ''} readOnly />
    </div>
  );
}
