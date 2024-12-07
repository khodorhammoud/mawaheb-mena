import React, { useState, useEffect, useRef } from "react";

type StatusType = "active" | "draft" | "paused" | "close";

interface StatusButtonProps {
  status: StatusType;
  onStatusChange: (newStatus: StatusType) => void;
}

const JobStateButton: React.FC<StatusButtonProps> = ({
  status,
  onStatusChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statusStyles: Record<StatusType, string> = {
    active: "bg-green-800 text-white",
    draft: "bg-gray-400 text-white",
    paused: "bg-yellow-600 text-white",
    close: "bg-red-800 text-white",
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleStatusChange = (newStatus: StatusType) => {
    onStatusChange(newStatus);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
      <button
        onClick={toggleDropdown}
        className={`px-2 py-1 rounded lg:text-base text-sm flex items-center ${statusStyles[status]}`}
      >
        {status === "close"
          ? "Closed"
          : status.charAt(0).toUpperCase() + status.slice(1)}
        {status !== "close" && (
          <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-32 bg-white border rounded shadow-lg z-10">
          <ul>
            {(["active", "draft", "paused", "close"] as StatusType[]).map(
              (option) => (
                <li
                  key={option}
                  onClick={() => handleStatusChange(option)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    option === "close" ? "" : "text-gray-800"
                  } ${option === status ? "font-semibold text-primaryColor" : ""}`}
                >
                  {option === "close"
                    ? "Closed"
                    : option.charAt(0).toUpperCase() + option.slice(1)}
                  {option === status && (
                    <span className="ml-2 text-primaryColor">✔</span>
                  )}
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobStateButton;
