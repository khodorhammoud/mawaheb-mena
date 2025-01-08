import { cn } from "~/lib/utils";

interface DayTotalProps {
    total: number;
    className?: string;
}

export function DayTotal({ total, className }: DayTotalProps) {
    const roundedTotal = Math.round(total * 10) / 10; // Round to 1 decimal place

    return (
        <div className={cn("flex flex-col border-t border-gray-200", className)}>
            <div className="py-2 px-4 text-sm text-gray-600">
                Total
            </div>
            <div className="pb-2 px-4 font-medium">
                {roundedTotal} h
            </div>
        </div>
    );
}