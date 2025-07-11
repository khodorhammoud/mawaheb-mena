import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import AppFormField from '~/common/form-fields';

interface BudgetFilterProps {
  filters: { budget: number | null };
  setFilters: (filters: any) => void;
}

export default function BudgetFilter({ filters, setFilters }: BudgetFilterProps) {
  const [budget, setBudget] = useState<number | ''>(filters.budget || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [hasValue, setHasValue] = useState<boolean>(filters.budget !== null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (filters.budget === null) {
      setHasValue(false);
    }
  }, [filters.budget]);

  const saveBudget = () => {
    const budgetValue = parseInt(budget.toString(), 10);

    if (isNaN(budgetValue) || budgetValue < 1) {
      showError('Budget must be at least $1.');
      return;
    }

    setFilters((prev: any) => ({ ...prev, budget: budgetValue }));
    setHasValue(true);
    setIsOpen(false);
  };

  const clearBudget = () => {
    setFilters((prev: any) => ({ ...prev, budget: null }));
    setBudget('');
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="group border border-gray-300 text-primaryColor bg-white rounded-[10px] px-3 py-2 flex items-center gap-2 hover:bg-primaryColor hover:text-white transition not-active-gradient text-sm leading-4"
          onClick={() => setIsOpen(true)}
        >
          Budget
          {hasValue && (
            <X
              size={20}
              className="text-gray-500 p-[2px] rounded-full transition 
              group-hover:text-white hover:bg-gray-400"
              onClick={e => {
                e.stopPropagation();
                clearBudget();
              }}
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[290px] mt-2 border border-gray-300 rounded-[10px]"
        align="center"
        side="bottom"
        onPointerDownOutside={() => setIsOpen(false)}
      >
        <div className="py-1 px-2">
          <h3 className="mb-4">Enter Budget ($)</h3>

          {errorMessage && (
            <div
              className={`px-4 py-3 rounded relative mt-2 mb-6 text-center bg-red-100 border border-red-400 text-red-700 transition-opacity duration-500 ${
                fadeOut ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {errorMessage}
            </div>
          )}

          <div className="mb-4" key={inputKey}>
            <AppFormField
              key={inputKey}
              id="budget"
              name="budget"
              label="Budget ($)"
              type="number"
              placeholder="Enter budget (min $1)"
              min={1}
              defaultValue={budget.toString()}
              onChange={e =>
                setBudget(
                  e.target.value.replace(/[^0-9]/g, '') // Prevents non-numeric input
                )
              }
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              className="text-primaryColor hover:bg-gray-300 hover:text-white transition rounded-xl px-4 py-2 border border-gray-300 mt-1"
              onClick={clearBudget}
            >
              Clear
            </Button>
            <Button
              onClick={saveBudget}
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
