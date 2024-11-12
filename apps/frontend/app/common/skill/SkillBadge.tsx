import React from "react";
import { Badge } from "~/components/ui/badge";

interface SkillBadgeProps {
  name: string;
  isStarred: boolean;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ name, isStarred }) => {
  return (
    <Badge
      className={`px-4 py-1 rounded-full text-sm h-8 ${
        isStarred ? "bg-cyan-600 text-white" : "bg-gray-200 text-gray-800"
      }`}
    >
      {isStarred && <span className="mr-2 text-2xl">★</span>}{" "}
      {/* Star icon if starred */}
      {name}
    </Badge>
  );
};

export default SkillBadge;
