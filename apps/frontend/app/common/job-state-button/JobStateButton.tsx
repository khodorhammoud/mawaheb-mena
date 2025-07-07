import { useFetcher } from '@remix-run/react';
import { useState } from 'react';
import { JobStatus, AccountStatus } from '@mawaheb/db/enums';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import { FaChevronDown } from 'react-icons/fa';
import { useToast } from '~/components/hooks/use-toast';

interface StatusButtonProps {
  status: JobStatus;
  jobId: number;
  onStatusChange?: (newStatus: JobStatus) => void;
  className?: string;
  userAccountStatus?: string;
}

export default function JobStateButton({
  status,
  jobId,
  onStatusChange,
  className, // Accept custom styles
  userAccountStatus,
}: StatusButtonProps) {
  const fetcher = useFetcher();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<JobStatus>(status);

  // Check if deactivated based on props
  const isDeactivated = userAccountStatus === AccountStatus.Deactivated;

  // console.log('JobStateButton: User account status:', userAccountStatus);
  // console.log('JobStateButton: Is deactivated?', isDeactivated);

  const statusStyles: Record<JobStatus, string> = {
    active: 'bg-green-800 text-white hover:!bg-green-900',
    running: 'bg-orange-500 text-white hover:!bg-orange-600', // <<< NEW!
    draft: 'bg-gray-400 text-white hover:!bg-gray-500 focus:!bg-gray-500',
    paused: 'bg-yellow-600 text-white hover:!bg-yellow-700',
    closed: 'bg-red-900 text-white hover:!bg-red-800',
    deleted: 'bg-red-800 text-white hover:!bg-red-900',
    completed: 'bg-blue-700 text-white hover:!bg-blue-800',
  };

  const handleStatusChange = (newStatus: JobStatus) => {
    // console.log('Trying to change status to:', newStatus);
    // console.log('Current user account status:', userAccountStatus);

    // If the user is deactivated, show toast message and prevent status change
    if (isDeactivated) {
      // console.log('User is deactivated, showing toast');
      toast({
        variant: 'destructive',
        title: 'Action Not Allowed',
        description: "You can't change a state while your account is deactivated",
      });
      return; // Early return to prevent status change
    }

    // console.log('User is NOT deactivated, proceeding with status change');
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
    <DropdownMenu open={isDeactivated ? false : undefined}>
      <DropdownMenuTrigger asChild>
        <Button
          className={`w-[106px] h-[36px] flex items-center justify-center rounded-xl text-sm ${
            statusStyles[selectedStatus]
          } ${className} ${isDeactivated ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={e => {
            if (isDeactivated) {
              e.preventDefault();
              e.stopPropagation();
              toast({
                variant: 'destructive',
                title: 'Action Not Allowed',
                description: "You can't change a state while your account is deactivated",
              });
            }
          }}
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
