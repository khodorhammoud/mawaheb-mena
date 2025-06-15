import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useEffect, useState } from 'react';

interface YearDropdownFieldProps {
  id: string;
  label?: string;
  year?: number;
  onYearChange: (year: number) => void;
  error?: string;
}

export default function YearDropdownField({
  id,
  label,
  year,
  onYearChange,
  error,
}: YearDropdownFieldProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
  const [selected, setSelected] = useState<string | undefined>(year?.toString());

  useEffect(() => {
    setSelected(year?.toString());
  }, [year]);

  return (
    <div className="relative w-full">
      <Label
        htmlFor={id}
        className="absolute left-4 top-0 text-gray-500 sm:text-base text-sm bg-white px-1 transition-all transform -translate-y-2/3 md:-translate-y-1/2
          peer-placeholder-shown:top-6 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500
          sm:peer-placeholder-shown:text-base peer-placeholder-shown:text-sm
          peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:px-1
          peer:not(:placeholder-shown):top-0 peer:not(:placeholder-shown):left-4 peer:not(:placeholder-shown):text-primaryColor peer:not(:placeholder-shown):bg-white peer:not(:placeholder-shown):px-1"
      >
        {label}
      </Label>

      <Select
        value={selected}
        onValueChange={val => {
          setSelected(val);
          onYearChange(Number(val));
        }}
      >
        <SelectTrigger
          className="md:w-[50%] peer mt-0 w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none text-l bg-white text-gray-900 autofill-fix flex items-center justify-between"
          id={id}
        >
          <SelectValue placeholder="Select Year" />
        </SelectTrigger>
        <SelectContent>
          <div className="ml-4 text-sm mt-1 mb-2">Select Year:</div>
          {years.map((y, i) => (
            <SelectItem
              key={y}
              value={y.toString()}
              className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 transition-colors border-gray-200   ${
                i == 0 ? 'border-t border-b' : 'border-b'
              }`}
            >
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <p className="ml-1 mt-2 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}
