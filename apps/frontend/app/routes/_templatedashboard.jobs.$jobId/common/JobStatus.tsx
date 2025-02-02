import { useState, useRef, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { JobApplicationStatus } from "~/types/enums";
import { Button } from "~/components/ui/button";

type StatusDropdownProps = {
  currentStatus: JobApplicationStatus;
  applicationId: number;
};

export default function StatusDropdown({
  currentStatus,
  applicationId,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const fetcher = useFetcher();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleStatusChange = (newStatus: JobApplicationStatus) => {
    fetcher.submit(
      { applicationId: applicationId.toString(), status: newStatus },
      { method: "post" }
    );

    // Optimistically update the UI
    setStatus(newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button
        onClick={toggleDropdown}
        className="border border-gray-300 rounded-xl px-4 py-2 text-sm xl:text-base"
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Button>
      {isOpen && (
        <div className="absolute mt-2 bg-white border rounded shadow-lg z-10">
          <ul>
            {Object.values(JobApplicationStatus).map((statusOption) => (
              <li
                key={statusOption}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                role="button"
                tabIndex={0}
                onClick={() => handleStatusChange(statusOption)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleStatusChange(statusOption);
                  }
                }}
              >
                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
