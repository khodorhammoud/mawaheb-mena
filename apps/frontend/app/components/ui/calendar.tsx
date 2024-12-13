"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CaptionProps, DayPicker, DayPickerProps } from "react-day-picker";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface CustomCaptionProps {
  locale?: string;
  displayMonth: Date;
  onMonthChange: (date: Date) => void;
}

function CustomCaption({
  locale = "default",
  displayMonth,
  onMonthChange,
}: CustomCaptionProps) {
  const months = [...Array(12)].map((_, i) =>
    new Date(0, i).toLocaleString(locale, { month: "long" })
  );

  const years = [];
  for (let y = 1900; y <= 2100; y++) {
    years.push(y);
  }

  const handleMonthChange = (_month) => {
    console.log(_month);
    const month = parseInt(_month, 10);
    const year = displayMonth.getFullYear();
    onMonthChange(new Date(year, month));
  };

  const handleYearChange = (_year) => {
    console.log(_year);
    const year = parseInt(_year, 10);
    const month = displayMonth.getMonth();
    onMonthChange(new Date(year, month));
  };

  return (
    <div className="flex justify-center items-center space-x-4">
      <div className="relative">
        <Select
          onValueChange={handleMonthChange}
          defaultValue={displayMonth.getMonth().toString()}
        >
          <SelectTrigger className="text-sm font-medium focus:outline-none px-4 py-2 pr-8">
            <SelectValue placeholder={displayMonth.getMonth().toString()} />
          </SelectTrigger>
          <SelectContent>
            {months.map((monthName, index) => (
              <SelectItem key={index} value={index.toString()}>
                {monthName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* <select
          className="appearance-none bg-transparent text-sm font-medium focus:outline-none hover:cursor-pointer px-4 py-2 pr-8"
          onChange={handleMonthChange}
          value={displayMonth.getMonth()}
        >
          {months.map((monthName, index) => (
            <option key={index} value={index}>
              {monthName}
            </option>
          ))}
        </select> */}
      </div>
      <div className="relative">
        <Select
          onValueChange={handleYearChange}
          defaultValue={displayMonth.getFullYear().toString()}
        >
          <SelectTrigger className="text-sm font-medium px-4 py-2 pr-8">
            <SelectValue placeholder={displayMonth.getFullYear().toString()} />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* <select
          className="appearance-none bg-transparent text-sm font-medium focus:outline-none hover:cursor-pointer px-4 py-2 pr-8"
          onChange={handleYearChange}
          value={displayMonth.getFullYear()}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select> */}
      </div>
    </div>
  );
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  defaultMonth = new Date(),
  ...props
}: DayPickerProps & {
  className?: string;
  classNames?: object;
}) {
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent rounded-full p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "hidden",
        nav_button_next: "hidden",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 rounded-full font-normal aria-selected:opacity-100 hover:bg-[#004a51] hover:text-white"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Caption: (props: CaptionProps) => (
          <CustomCaption
            displayMonth={props.displayMonth}
            locale="en-US"
            onMonthChange={setCurrentMonth}
          />
        ),
      }}
      {...props}
    />
  );
}
