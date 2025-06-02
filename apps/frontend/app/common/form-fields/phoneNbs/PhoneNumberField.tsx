import { useState } from 'react';
import { Country } from '@mawaheb/db/enums';
import { COUNTRY_FLAGS, PHONE_CODES } from '@mawaheb/db/types/country-meta';
import { ComboBox } from '~/components/ui/combobox'; // your ComboBox

const COUNTRIES = Object.values(Country);

const countryMetaList = COUNTRIES.map(country => ({
  country,
  code: PHONE_CODES[country],
  flag: COUNTRY_FLAGS[country],
}));

export default function PhoneNumberField({
  id,
  name,
  defaultValue = '+961',
  onChange,
  className = 'w-full',
}) {
  // Set default selection
  const defaultCountry =
    countryMetaList.find(c => c.code === defaultValue) ||
    countryMetaList.find(c => c.country === Country.Lebanon);

  const [selected, setSelected] = useState(defaultCountry?.code);

  function handleSelect(val) {
    setSelected(val);
    const meta = countryMetaList.find(c => c.code === val);
    onChange?.({
      target: {
        id,
        name: name || 'phone-code',
        value: meta?.code || '',
      },
    });
  }

  return (
    <div className={className}>
      <ComboBox
        options={countryMetaList.map(c => ({
          value: c.code,
          label: (
            <span className="flex items-center gap-2">
              {c.flag && <img src={c.flag} alt="" className="w-5 h-4" />}
              <span className="font-medium">{c.code}</span>
            </span>
          ),
        }))}
        value={selected}
        onChange={handleSelect}
        placeholder="Select code"
        className="border-none hover:bg-transparent w-full"
      />
      <input type="hidden" id={id} name={name} value={selected || ''} readOnly />
    </div>
  );
}
