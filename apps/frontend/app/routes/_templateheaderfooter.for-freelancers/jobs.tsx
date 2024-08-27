import React from "react";

type Job = {
  title: string;
  price: string;
  experience: string;
  technologies: string[];
  postedTime: string;
};

const jobs: Job[] = [
  {
    title: "IOS, Android Sensor API Plugin for Unity",
    price: "$500",
    experience: "Entry",
    technologies: ["Java Development", "Android", "iOS", "C#", "Kotlin"],
    postedTime: "Posted 20 hours ago",
  },
  {
    title: "IOS, Android Sensor API Plugin for Unity",
    price: "$500",
    experience: "Entry",
    technologies: ["Java Development", "Android", "iOS", "C#", "Kotlin"],
    postedTime: "Posted 20 hours ago",
  },
  {
    title: "IOS, Android Sensor API Plugin for Unity",
    price: "$500",
    experience: "Entry",
    technologies: ["Java Development", "Android", "iOS", "C#", "Kotlin"],
    postedTime: "Posted 20 hours ago",
  },
];

// const Jobs = () => {
//   return (
//     <div>
//       <p></p>
//     </div>
//   );
// };

const Jobs: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-6 p-6 mt-20">
      {jobs.map((job, index) => (
        <div
          key={index}
          className="bg-white border border-gray-300 rounded-xl shadow-xl p-6 flex flex-col"
        >
          <div className="flex justify-between gap-10 items-center mb-4">
            <h3 className="text-xl font-semibold">{job.title}</h3>
            <p className="text-lg font-bold text-gray-800">{job.price}</p>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Experience level: {job.experience}
          </p>
          <p className="text-sm text-gray-500 mb-4">{job.postedTime}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {job.technologies.map((tech, techIndex) => (
              <span
                key={techIndex}
                className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-xl"
              >
                {tech}
              </span>
            ))}
          </div>
          <button className="mt-auto bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 max-w-fit">
            See more
          </button>
        </div>
      ))}
    </div>
  );
};

export default Jobs;
