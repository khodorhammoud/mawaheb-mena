import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { JobStatus } from "~/types/enums";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

interface StatusButtonProps {
  status: JobStatus;
  jobId: number;
  onStatusChange?: (newStatus: JobStatus) => void;
}

export default function JobStateButton({
  status,
  jobId,
  onStatusChange,
}: StatusButtonProps) {
  const fetcher = useFetcher();
  const [selectedStatus, setSelectedStatus] = useState<JobStatus>(status);

  const statusStyles: Record<JobStatus, string> = {
    active: "bg-green-800 text-white hover:bg-green-900",
    draft: "bg-gray-400 text-white hover:bg-gray-500",
    paused: "bg-yellow-600 text-white hover:bg-yellow-700",
    closed: "bg-red-400 text-white hover:bg-red-500",
    deleted: "bg-red-800 text-white hover:bg-red-900",
  };

  const handleStatusChange = (newStatus: JobStatus) => {
    setSelectedStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }

    fetcher.submit(
      { jobId: jobId.toString(), status: newStatus },
      { method: "post", action: "/manage-jobs" }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`lg:px-3 px-2 lg:py-2 py-1 rounded lg:text-base text-sm outline-none ${statusStyles[selectedStatus]}`}
        >
          {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
          <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 right-0 shadow-md rounded-md bg-white border">
        {(Object.values(JobStatus) as JobStatus[]).map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => handleStatusChange(option)} // 🔥 `onSelect` instead of `onClick`
            className={`cursor-pointer px-4 py-2 rounded-md hover:bg-gray-100 outline-none focus:ring-0 focus:outline-none ${
              option === selectedStatus ? "font-semibold text-primaryColor" : ""
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
