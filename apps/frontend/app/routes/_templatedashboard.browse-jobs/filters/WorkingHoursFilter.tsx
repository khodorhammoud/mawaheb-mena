import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import AppFormField from '~/common/form-fields';

interface WorkingHoursFilterProps {
  filters: { workingHours: { from: string; to: string } | null };
  setFilters: (filters: any) => void;
}

export default function WorkingHoursFilter({ filters, setFilters }: WorkingHoursFilterProps) {
  const [workingHours, setWorkingHours] = useState({
    from: filters.workingHours?.from || '',
    to: filters.workingHours?.to || '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [hasValue, setHasValue] = useState<boolean>(filters.workingHours !== null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (filters.workingHours === null) {
      setHasValue(false);
    }
  }, [filters.workingHours]);

  const saveWorkingHours = () => {
    const from = parseInt(workingHours.from);
    const to = parseInt(workingHours.to);

    if (isNaN(from) || isNaN(to)) {
      showError("Both 'From' and 'To' fields must be filled.");
      return;
    }
    if (from < 0 || to < 0) {
      showError('Values cannot be negative.');
      return;
    }
    if (from >= to) {
      showError("'From' value must be less than 'To' value.");
      return;
    }

    setFilters((prev: any) => ({
      ...prev,
      workingHours: { from, to },
    }));
    setHasValue(true);
    setIsOpen(false);
  };

  const clearWorkingHours = () => {
    setFilters((prev: any) => ({ ...prev, workingHours: null }));
    setWorkingHours({ from: '', to: '' });
    setErrorMessage(null);
    setHasValue(false);
    setInputKey(prevKey => prevKey + 1);
    setIsOpen(false);
  };

  const showError = (message: string) => {
    setFadeOut(false);
    setErrorMessage(message);

    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setErrorMessage(null);
      }, 500);
    }, 2000);
  };

  const handleInputChange = (e: any, field: 'from' | 'to') => {
    let value = e.target.value;

    // Prevents negative input by resetting the field if a negative number is typed
    if (value.includes('-')) {
      showError('Values cannot be negative.');
      setWorkingHours(prev => ({ ...prev, [field]: '' }));
      return;
    }

    // Only allow numbers (removes non-numeric characters)
    if (!/^\d*$/.test(value)) return;

    setWorkingHours(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="group border border-gray-300 text-primaryColor bg-white rounded-[10px] px-3 py-2 flex items-center gap-2 hover:bg-primaryColor hover:text-white transition not-active-gradient text-sm leading-4"
          onClick={() => setIsOpen(true)}
        >
          <span className="whitespace-nowrap">Working Hours</span>
          {hasValue && (
            <X
              size={20}
              className="text-gray-500 p-[2px] rounded-full transition 
              group-hover:text-white hover:bg-gray-400"
              onClick={e => {
                e.stopPropagation();
                clearWorkingHours();
              }}
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[380px] mt-2 border border-gray-300 rounded-[10px]"
        align="center"
        side="bottom"
        onPointerDownOutside={() => setIsOpen(false)}
      >
        <div className="py-1 px-2">
          <h1 className="mb-4">Enter Working Hours:</h1>

          {errorMessage && (
            <div
              className={`px-4 py-3 rounded relative mt-2 mb-6 text-center bg-red-100 border border-red-400 text-red-700 transition-opacity duration-500 ${
                fadeOut ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {errorMessage}
            </div>
          )}

          <div className="flex gap-4 mb-4" key={inputKey}>
            <AppFormField
              key={inputKey + '-from'}
              id="from"
              name="from"
              type="text"
              placeholder="From (hours)"
              label="From (hours)"
              defaultValue={workingHours.from}
              onChange={e => handleInputChange(e, 'from')}
            />
            <AppFormField
              key={inputKey + '-to'}
              id="to"
              name="to"
              type="text"
              placeholder="To (hours)"
              label="To (hours)"
              defaultValue={workingHours.to}
              onChange={e => handleInputChange(e, 'to')}
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              className="text-primaryColor hover:bg-gray-300 hover:text-white transition rounded-xl px-4 py-2 border border-gray-300 mt-1 focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
              onClick={clearWorkingHours}
            >
              Clear
            </Button>
            <Button
              onClick={saveWorkingHours}
              className="bg-primaryColor text-white px-4 py-2 rounded-xl not-active-gradient hover:bg-primaryColor mt-1 focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
