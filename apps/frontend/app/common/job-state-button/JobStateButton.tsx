import { useFetcher } from '@remix-run/react';
import { useState } from 'react';
import { JobStatus } from '~/types/enums';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import { FaChevronDown } from 'react-icons/fa';

interface StatusButtonProps {
  status: JobStatus;
  jobId: number;
  onStatusChange?: (newStatus: JobStatus) => void;
  className?: string;
}

export default function JobStateButton({
  status,
  jobId,
  onStatusChange,
  className, // Accept custom styles
}: StatusButtonProps) {
  const fetcher = useFetcher();
  const [selectedStatus, setSelectedStatus] = useState<JobStatus>(status);

  const statusStyles: Record<JobStatus, string> = {
    active: 'bg-green-800 text-white hover:!bg-green-900',
    draft: 'bg-gray-400 text-white hover:!bg-gray-500 focus:!bg-gray-500',
    paused: 'bg-yellow-600 text-white hover:!bg-yellow-700',
    closed: 'bg-red-900 text-white hover:!bg-red-800',
    deleted: 'bg-red-800 text-white hover:!bg-red-900',
  };

  const handleStatusChange = (newStatus: JobStatus) => {
    setSelectedStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }

    fetcher.submit(
      { jobId: jobId.toString(), status: newStatus },
      { method: 'post', action: '/manage-jobs' }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`w-[106px] h-[36px] flex items-center justify-center rounded-xl text-sm ${statusStyles[selectedStatus]} ${className}`}
        >
          {/* Arrow icon */}
          <FaChevronDown className="w-3 h-3 mr-2 text-white" />

          {/* Selected status */}
          <div className="mr-1">
            {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40 right-0 shadow-md rounded-md bg-white border">
        {(Object.values(JobStatus) as JobStatus[]).map(option => (
          <DropdownMenuItem
            key={option}
            onSelect={() => handleStatusChange(option)}
            className={`cursor-pointer px-4 py-2 rounded-md hover:bg-gray-100 outline-none focus:ring-0 focus:outline-none ${
              option === selectedStatus ? 'font-semibold text-primaryColor' : ''
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
