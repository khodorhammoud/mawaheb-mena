import React from 'react';
import SkillBadgeList from '~/common/skill/SkillBadge'; // 🔁 update the path to your actual component

interface CarouselCardProps {
  image: string;
  name: string;
  role: string;
  hourlyRate: string;
  skills: { name: string; isStarred: boolean }[];
}

export default function CarouselCard({ image, name, role, hourlyRate, skills }: CarouselCardProps) {
  return (
    <div className="font-['Switzer-Regular'] max-w-96 min-w-96 rounded-xl overflow-hidden shadow-sm border-2 border-slate-300 h-auto bg-slate-100">
      <img className="w-full h-52 object-cover" src={image} alt={name} />
      <div className="pt-6 pl-4 min-h-64">
        <a href="#" className="text-xl">
          {name}
        </a>
        <p className="text-l text-gray-600">{role}</p>
        <p className="my-6 text-gray-600">{hourlyRate}</p>
        <div className="">
          <SkillBadgeList skills={skills} />
        </div>
      </div>
    </div>
  );
}
