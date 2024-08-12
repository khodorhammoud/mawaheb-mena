// i shall work here, since that is an end point

// interface CarouselCardProps {
// 	title: string;

import React from "react";

interface CarouselCardProps {
  image: string;
  name: string;
  role: string;
  hourlyRate: string;
  skills: string[];
}

export default function CarouselCard({
  image,
  name,
  role,
  hourlyRate,
  skills,
}: CarouselCardProps) {
  return (
    <div className=" font-['Switzer-Regular'] max-w-96 min-w-96 rounded-xl overflow-hidden shadow-sm border-2 border-slate-300 h-auto bg-slate-100">
      <img className="w-full h-52 object-cover" src={image} alt={name} />
      <div className="pt-6 pl-4 min-h-64">
        <h2 className="text-xl">{name}</h2>
        <p className="text-l text-gray-600">{role}</p>
        <p className="my-6 text-gray-600">{hourlyRate}</p>
        <div className="my-4 px-4 flex flex-wrap gap-2 text-xl">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-2 bg-white rounded-full text-sm font-['Switzer-Regular']"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
