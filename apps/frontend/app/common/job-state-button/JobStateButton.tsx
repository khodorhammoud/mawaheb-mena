import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { useFetcher } from "@remix-run/react";
import { JobStatus } from "~/types/enums";

interface StatusButtonProps {
  status: JobStatus;
  jobId: number; // Pass jobId as a prop
  onStatusChange?: (newStatus: JobStatus) => void;
}

export default function JobStateButton({
  status,
  jobId,
  onStatusChange,
}: StatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const fetcher = useFetcher(); // Use Remix fetcher for server-side communication

  const statusStyles: Record<JobStatus, string> = {
    active: "bg-green-800 text-white",
    draft: "bg-gray-400 text-white",
    paused: "bg-yellow-600 text-white",
    closed: "bg-red-400 text-white",
    deleted: "bg-red-800 text-white",
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleStatusChange = (newStatus: JobStatus) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }

    // Use fetcher to call action
    fetcher.submit(
      { jobId: jobId.toString(), status: newStatus },
      { method: "post", action: "/manage-jobs" }
    );

    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button
        onClick={toggleDropdown}
        className={`px-2 py-1 rounded lg:text-base text-sm flex items-center ${statusStyles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
        <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute mt-2 w-32 bg-white border rounded shadow-lg z-10">
          <ul>
            {(Object.values(JobStatus) as JobStatus[]).map((option) => (
              <Button
                key={option}
                type="button"
                onClick={() => handleStatusChange(option)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  option === status ? "font-semibold text-primaryColor" : ""
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
