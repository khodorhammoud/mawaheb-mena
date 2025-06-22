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

export function ComboBox({ options, value, onChange, placeholder, className }: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find(option => option.value === value);

  // 👇 Add these lines
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = React.useState<number>();

  React.useEffect(() => {
    if (triggerRef.current) {
      setPopoverWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef} // 👈 Add this
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between px-4 md:py-1 border border-gray-300 rounded-xl focus:outline-none text-l bg-white text-gray-900',
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
        style={popoverWidth ? { width: popoverWidth } : undefined} // 👈 Dynamically set width
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
