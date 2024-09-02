import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";

const features = [
  {
    title: "Tailored Software Solutions",
    description:
      "Harness the expertise of top-notch freelancers proficient in a wide array of skills to craft outstanding digital products tailored to your needs. Our curated talent pool includes specialists in front-end and back-end development, design, content creation.",
    style: "absolute fill-primaryColor stroke-primaryColor",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" fill="#27638a" stroke="#27638a" width="60" height="60" viewBox="0 0 64 64">...</svg>`,
  },
  {
    title: "Expert Freelancer Matching",
    description:
      "Let us assist you in finding exceptional freelancers who can deliver outstanding results for your next big idea. Our platform connects you with top talent, ensuring your projects are completed with the highest level of quality and professionalism.",
    style: "absolute stroke-primaryColor",
    icon: `<svg fill="#fff" width="60px" height="60px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">...</svg>`,
  },
  {
    title: "AI-Powered Matchmaking",
    description:
      "Utilize our AI matching system to connect with the perfect freelancers who possess the precise skills to bring your vision to life. Experience seamless project execution with talent tailored to your specific needs, ensuring exceptional quality and results.",
    style:
      "absolute text-primaryColor fill-primaryColor stroke-primaryColor pt-3",
    icon: `<svg width="55px" height="55px" fill="#27638a" stroke="#27638a" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 496 496" xml:space="preserve">...</svg>`,
  },
  {
    title: "Comprehensive Crew Formation",
    description:
      "Build your complete crew of talented freelancers with us, ensuring every aspect of your jobs is handled perfectly. From project initiation to final delivery, our experts will manage every detail, providing you with exceptional quality and seamless execution.",
    style: "absolute text-primaryColor fill-primaryColor stroke-primaryColor",
    icon: `<svg height="60px" width="60px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/1999/xlink" viewBox="0 0 489.6 489.6" xml:space="preserve" fill="#27638a" stroke="#27638a">...</svg>`,
  },
];

export default function FeaturesSection() {
  const numCircles = 5000;

  return (
    <section className="py-24 mt-[-100px] custom-gradient relative">
      {/* Circle grid overlay */}
      <div className="circle-grid">
        {Array.from({ length: numCircles }).map((_, idx) => (
          <div key={idx} className="circle" />
        ))}
      </div>

      <div className="container px-10 relative z-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white shadow-lg rounded-[10px] border-2 border-slate-300 z-10"
            >
              <CardHeader className="flex items-center justify-center p-4 relative">
                <div
                  className={`${feature.style} absolute -top-10 left-4 p-2 text-primaryColor`}
                  dangerouslySetInnerHTML={{ __html: feature.icon }}
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="font-bold text-2xl tracking-wider pb-8 font-['Switzer-Regular']">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-700 text-base mt-2 font-['Switzer-Regular'] pb-8">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
