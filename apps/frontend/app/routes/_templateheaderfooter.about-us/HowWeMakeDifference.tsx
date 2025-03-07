import React, { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Type for the fetched data
interface HowWeMakeDiff {
  id: string;
  title: string;
  description: string;
  iconSVG: string;
  belongingText: string;
}

interface LoaderData {
  howWeMakeDiffSection: HowWeMakeDiff[];
}

const HowWeMakeDifference: React.FC = () => {
  const { howWeMakeDiffSection } = useLoaderData<LoaderData>();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="font-['Switzer-Regular'] mb-40 mt-24">
      <div>
        <p className="!leading-normal xl:text-6xl lg:text-5xl md:text-4xl sm:text-3xl text-2xl font-['BespokeSerif-Regular'] font-bold lg:w-[650px] sm:w-[400px] w-[250px]">
          HERE'S HOW WE MAKE A DIFFERENCE
        </p>
      </div>

      {/* Layout with 40% Left and 60% Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] lg:mt-14 gap-8">
        {/* Left Section: Belonging Text */}
        <div className="flex flex-col px-8 mt-10">
          <div
            className="text-lg leading-normal"
            dangerouslySetInnerHTML={{
              __html:
                howWeMakeDiffSection[activeIndex]?.belongingText ||
                "Default text goes here.",
            }}
          />
        </div>

        {/* Right Section: Swiper Slider */}
        <Swiper
          slidesPerView={1}
          spaceBetween={30} // Adds space between slides
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="w-full"
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 1.2,
            },
            1024: {
              slidesPerView: 1.5,
            },
          }}
        >
          {howWeMakeDiffSection.map((box, index) => (
            <SwiperSlide key={box.id}>
              <div
                className="rounded-xl text-white p-10 min-h-[500px]"
                style={{
                  width: "100%",
                  backgroundColor: "#27638a",
                }}
              >
                <div className="h-[20%] flex items-center">
                  <p className="text-4xl">{index + 1}</p>
                  <i className={`text-4xl ${box.iconSVG}`}></i>
                </div>
                <div className="h-[65%]">
                  <h3 className="text-4xl xl:text-5xl lg:text-4xl md:text-3xl leading-snug my-4">
                    {box.title}
                  </h3>
                  <p className="text-xl leading-relaxed mt-10">
                    {box.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default HowWeMakeDifference;
