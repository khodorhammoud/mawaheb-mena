// app/components/StatusButton.tsx
import React from "react";

type StatusType = "active" | "draft" | "closed" | "paused";

interface StatusButtonProps {
  status: StatusType;
  className?: string;
}

const StatusButton: React.FC<StatusButtonProps> = ({ status }) => {
  // Define the styles for each state
  const statusStyles: Record<StatusType, string> = {
    active: "bg-green-800 text-white", // Dark green
    draft: "bg-gray-400 text-white", // Grey
    closed: "bg-brown-600 text-white", // Brown
    paused: "bg-yellow-600 text-white", // Mustard
  };

  // Get the style based on the status
  const currentStyle = statusStyles[status] || "bg-gray-200 text-black";

  return (
    <button className={`px-4 py-2 rounded ${currentStyle}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}{" "}
      {/* Capitalize first letter */}
    </button>
  );
};

export default StatusButton;
