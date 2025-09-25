import React from 'react';
import { Badge } from '~/components/ui/badge';
import { Star } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  isStarred: boolean;
}

interface SkillBadgeListProps {
  skills?: { name: string; isStarred: boolean }[];
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ name, isStarred }) => {
  return (
    <Badge
      className={`flex items-center gap-2 rounded-full text-xs h-7 ${
        isStarred ? 'bg-[#4BA4A4] text-white' : 'bg-gray-200 text-gray-800'
      }`}
      data-testid={`skill-badge-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {isStarred && <Star className="w-3 h-3 fill-white text-white" />} {/* Star icon */}
      <span className="font-medium">{name}</span>
    </Badge>
  );
};

const SkillBadgeList: React.FC<SkillBadgeListProps> = ({ skills = [] }) => {
  const starredSkills = skills?.filter(skill => skill.isStarred) || [];
  const nonStarredSkills = skills?.filter(skill => !skill.isStarred) || [];

  return (
    <div className="flex gap-2 flex-wrap" data-testid="skill-badge-list">
      {[...starredSkills, ...nonStarredSkills].map((skill, index) => (
        <SkillBadge key={index} name={skill.name} isStarred={skill.isStarred} />
      ))}
    </div>
  );
};

export default SkillBadgeList;
