import { useState } from "react";
import React from "react";

interface ComboBoxProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function ComboBox({ value, onValueChange, children }: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* ComboBox Trigger */}
      <button
        onClick={handleToggle}
        className="border border-gray-300 text-primaryColor bg-white rounded-[10px] px-4 py-2 flex items-center gap-2 hover:bg-primaryColor hover:text-white transition w-full"
      >
        {value || "Select an option"}
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full border bg-white shadow-md rounded-md z-10">
          {React.Children.map(children, (child: any) => {
            if (child.type === ComboBoxItem) {
              return React.cloneElement(child, {
                onSelect: handleSelect,
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
}

interface ComboBoxItemProps {
  value: string;
  onSelect?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function ComboBoxItem({
  value,
  onSelect,
  className,
  children,
}: ComboBoxItemProps) {
  return (
    <button
      onClick={() => onSelect && onSelect(value)}
      className={`${className} px-4 py-2 cursor-pointer hover:bg-primaryColor hover:text-white transition`}
    >
      {children}
    </button>
  );
}
