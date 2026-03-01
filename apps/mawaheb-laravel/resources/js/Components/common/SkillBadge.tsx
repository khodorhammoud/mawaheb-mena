import { Star } from 'lucide-react';

interface SkillBadgeProps {
    name: string;
    isStarred: boolean;
}

export function SkillBadge({ name, isStarred }: SkillBadgeProps) {
    return (
        <span
            className={`flex items-center gap-2 rounded-full text-xs h-7 px-3 ${
                isStarred ? 'bg-[#4BA4A4] text-white' : 'bg-gray-200 text-gray-800'
            }`}
        >
            {isStarred && <Star className="w-3 h-3 fill-white text-white" />}
            <span className="font-medium">{name}</span>
        </span>
    );
}

export function SkillBadgeList({ skills = [] }: { skills?: { name: string; isStarred: boolean }[] }) {
    const starred = skills.filter((s) => s.isStarred);
    const nonStarred = skills.filter((s) => !s.isStarred);

    return (
        <div className="flex gap-2 flex-wrap">
            {[...starred, ...nonStarred].map((skill, i) => (
                <SkillBadge key={i} name={skill.name} isStarred={skill.isStarred} />
            ))}
        </div>
    );
}
