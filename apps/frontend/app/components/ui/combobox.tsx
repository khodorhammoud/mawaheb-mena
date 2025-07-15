'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

export type ComboBoxOption = {
  value: string;
  label: React.ReactNode;
};

interface ComboBoxProps {
  options: ComboBoxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// ✅ Use forwardRef to allow external access to the trigger button
export const ComboBox = React.forwardRef<HTMLButtonElement, ComboBoxProps>(
  ({ options, value, onChange, placeholder, className }, ref) => {
    const [open, setOpen] = React.useState(false);
    const selectedOption = options.find(option => option.value === value);

    // ✅ Internal ref for the trigger <Button>
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const [popoverWidth, setPopoverWidth] = React.useState<number>();

    // ✅ Hook the internal ref to external ref
    React.useImperativeHandle(ref, () => internalRef.current!, [internalRef]);

    // ✅ Dynamically set the width of the dropdown to match the button
    React.useLayoutEffect(() => {
      if (internalRef.current) {
        setPopoverWidth(internalRef.current.offsetWidth);
      }
    }, [open]);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={internalRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between px-4 md:py-1 border border-gray-300 rounded-xl focus:outline-none focus-visible:ring-0 focus-visible:outline-none focus:ring-0 focus:border-none focus-visible:border-none focus-visible:ring-offset-0 text-l bg-white text-gray-900',
              className
            )}
          >
            {selectedOption ? selectedOption.label : placeholder || 'Select...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="p-0"
          style={popoverWidth ? { width: popoverWidth } : undefined}
        >
          <Command>
            <CommandInput placeholder={placeholder || 'Search...'} />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {options.map(option => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={currentValue => {
                      onChange?.(currentValue);
                      setOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">{option.label}</span>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

// ✅ Set a proper displayName to avoid dev warnings
ComboBox.displayName = 'ComboBox';
