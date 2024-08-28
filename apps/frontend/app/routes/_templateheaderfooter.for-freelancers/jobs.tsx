import React from "react";

type Job = {
  title: string;
  price: string;
  experience: string;
  experienceLevel: string;
  description: string;
  technologies: string[];
  postedTime: string;
};

const jobs: Job[] = [
  {
    title: "IOS, Android Sensor API Plugin for Unity",
    price: "$500",
    experience: "Entry",
    experienceLevel: "the Experience level",
    description:
      "We are looking for the candidate having 0-3 years of experience in below technologies skills: IOS, ANdroinnd",
    technologies: ["Java Development", "Android", "iOS", "C#", "Kotlin"],
    postedTime: "Posted 20 hours ago",
  },
  {
    title: "IOS, Android Sensor API Plugin for Unity",
    price: "$500",
    experience: "Entry",
    experienceLevel: "the Experience level",
    description:
      "We are looking for the candidate having 0-3 years of experience in below technologies skills: IOS, ANdroinnd",
    technologies: ["Java Development", "Android", "iOS", "C#", "Kotlin"],
    postedTime: "Posted 20 hours ago",
  },
];

const Jobs: React.FC = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-6 p-6 mt-16">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl shadow-xl p-6 flex flex-col"
          >
            <div className="mb-2">
              <h3 className="text-xl font-semibold">{job.title}</h3>
            </div>
            <div className="flex flex-row">
              <p className="text-sm text-gray-400">Fixed price -&nbsp; </p>
              <p className="text-sm text-gray-400 mb-4">{job.postedTime}</p>
            </div>
            <div className="flex flex-row gap-24 mt-2 mb-6">
              <div>
                <p className="text-md text-gray-800">{job.price}</p>
                <p className="text-sm text-gray-400">Fixed price</p>
              </div>
              <div>
                <p className="text-md text-black">{job.experience}</p>
                <p className="text-sm text-gray-400">{job.experienceLevel}</p>
              </div>
            </div>
            <div className="leading-tight mb-4">{job.description}</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {job.technologies.map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="bg-cyan-600 text-white text-xs font-medium px-2 py-1 rounded-xl mb-4"
                >
                  {tech}
                </span>
              ))}
            </div>
            <button className="mt-auto bg-white text-primaryColor border-2 text-sm font-medium px-5 py-2 rounded-xl gradient-box not-active-gradient max-w-fit">
              See more
            </button>
          </div>
        ))}
      </div>
      <div className="text-center flex justify-center gap-3 items-center mt-5">
        <p className="text-lg font-semibold">Want to browse more jobs?</p>
        <button className="text-white bg-primaryColor gradient-box not-active-gradient max-w-fit rounded-xl px-5 py-2 text-sm">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Jobs;
