import React from "react";
import { RepeatableInputType } from "../types";
import type { FieldTemplateState, FormStateType } from "../types";
import Or from "~/common/or/Or";
import { IoLinkSharp } from "react-icons/io5";
import { IoBriefcaseSharp } from "react-icons/io5";
import { RiAwardFill } from "react-icons/ri";
import { FaGraduationCap } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";

interface FieldTemplateProps {
  value: FormStateType | RepeatableInputType[];
  cardTitle: string;
}

export const TextFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-8 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-sm font-medium mt-4 text-gray-400">
        {value as string}
      </span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">Not filled</span>
    </div>
  ),
};

export const TextAreaFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-8 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-sm font-medium mt-4 text-gray-400">
        {value as string}
      </span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">Not filled</span>
    </div>
  ),
};

export const NumberFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base font-medium">{value as number}</span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No number set</span>
    </div>
  ),
};

const Project_RepeatableFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pt-8 pb-6 pl-7 pr-10">
      <span className="text-lg font-medium">{cardTitle}</span>
      <div className="flex w-full h-auto rounded-xl mt-4 bg-white">
        {/* Image Section */}
        <div className="w-1/4 h-auto overflow-hidden rounded-l-xl">
          <img
            className="w-full h-full object-cover"
            src="https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
            alt={value as string}
          />
        </div>

        {/* Content Section */}
        <div className="w-3/4 flex flex-col text-base pl-6 pr-10 py-8">
          <h1 className="flex items-center text-xl mb-4 gap-4">
            E-commerce Website redesign
            <button
              className="flex items-center justify-center"
              aria-label="Link"
            >
              <IoLinkSharp className="h-9 w-8 hover:bg-slate-100 transition-all hover:rounded-xl p-1 text-primaryColor" />
            </button>
          </h1>
          <p className="mb-2 text-sm">
            As a UI/UX freelancer, I successfully redesigned the UI/UX of an
            established e-commerce website, resulting in a significant
            improvement in user engagement and conversion rates, and a
            freelancer, I successfully redesigned the UI/UX of an established
            e-commerc
          </p>
          <ul className="list-disc text-sm pl-8">
            <li className="leading-relaxed text-indent-0">
              Conducted comprehensive user research and analyzed website
              analytics to identify key pain points and opportunities for
              improvement.
            </li>
            <li className="leading-relaxed">
              Developed detailed wireframes, prototypes, and high-fidelity
              mockups that enhanced the visual appeal and usability of the site.
            </li>
            <li className="leading-relaxed">
              Conducted comprehensive user research and analyzed website
              analytics to identify key pain points and opportunities for
              improvement.
            </li>
          </ul>
        </div>
      </div>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No items added</span>
    </div>
  ),
};

const WorkHistory_RepeatableFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pt-7 pb-8 pl-7 pr-10">
      <span className="text-lg font-medium">{cardTitle}</span>
      <div className="flex flex-col w-full h-auto rounded-xl mt-4 bg-white pl-7 pr-14 pt-7 pb-7 gap-3">
        <h1 className="flex items-center text-xl mb-4 gap-2">
          <button
            className="flex items-center justify-center"
            aria-label="Link"
          >
            <IoBriefcaseSharp className="h-8 w-8 hover:bg-slate-100 transition-all hover:rounded-xl p-1 text-primaryColor" />
          </button>
          UI UX Designer
        </h1>
        <div className="flex gap-3 items-center">
          <p className="">Media Lab manU</p>
          <span className="text-2xl text-gray-200 font-extralight">|</span>
          <p className="text-sm">Oct 2022 - Dec 2023</p>
        </div>
        <div className="text-sm leading-6">
          hi borirowimvndismrifv i lodebvceuif gnodjhft tjfhsgqwowkr0tkfn
          12344555666543 fdhenrmtlogogjr t f eierhtnygogof fofoof dinewiwoooxhd
          fjfgp hylspe oker,t;eidcneu dndfn futrntkvdkmnswgsrreebf bnhi
          borirowimvn dismrifv i lodebvceuif gnodjhft tjfhsgq wowkr0tkfn
          12344555666543 fdhenrmt logogjr t f eierhtnygogoffofoof dinewiwoooxhd
          fjfgphylspeoker,t;eidcneudndfnfutrnt kvdkmnswgsrreebfbnh
        </div>
      </div>
      {/* Line if there is another Work experience */}
      {/* <div className="flex-grow border border-gray-300 mt-5 mb-1"></div>
      <div className="flex flex-col w-full h-auto rounded-xl mt-4 bg-white pl-7 pr-14 pt-7 pb-7 gap-3">
        <h1 className="flex items-center text-lg mb-4 gap-4">
          <button
            className="flex items-center justify-center"
            aria-label="Link"
          >
            <IoBriefcaseSharp className="h-8 w-8 hover:bg-slate-100 transition-all hover:rounded-xl p-1 mb-1 text-primaryColor" />
          </button>
          UI UX Designer
        </h1>
        <div className="flex gap-3 items-center">
          <p className="test-lg">Media Lab manU</p>
          <span className="text-2xl text-gray-200 font-extralight">|</span>
          <p className="text-sm">Oct 2022 - Dec 2023</p>
        </div>
        <div className="text-sm leading-6">
          hi borirowimvndismrifv i lodebvceuif gnodjhft tjfhsgqwowkr0tkfn
          12344555666543 fdhenrmtlogogjr t f eierhtnygogof fofoof dinewiwoooxhd
          fjfgp hylspe oker,t;eidcneu dndfn futrntkvdkmnswgsrreebf bnhi
          borirowimvn dismrifv i lodebvceuif gnodjhft tjfhsgq wowkr0tkfn
          12344555666543 fdhenrmt logogjr t f eierhtnygogoffofoof dinewiwoooxhd
          fjfgphylspeoker,t;eidcneudndfnfutrnt kvdkmnswgsrreebfbnh
        </div>
      </div> */}
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No items added</span>
    </div>
  ),
};

const Certificate_RepeatableFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pt-7 pb-8 pl-7 pr-28">
      <span className="text-lg font-medium mb-2">{cardTitle}</span>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col w-full h-auto rounded-xl mt-4 bg-white pl-8 pr-10 pt-8 pb-8 gap-3">
          <h1 className="flex text-xl mb-4 gap-1">
            <button
              className="flex items-center justify-center self-start mb-2"
              aria-label="Link"
            >
              <RiAwardFill className="h-8 w-8 hover:bg-slate-100 transition-all hover:rounded-xl p-1 text-primaryColor" />
            </button>
            Google user experience design, School of science
          </h1>
          <div className="flex gap-3 items-center">
            <p className="">Google</p>
            <span className="text-2xl text-gray-200 font-extralight">|</span>
            <p className="text-sm">2022</p>
          </div>
        </div>
        <div className="flex flex-col w-full h-auto rounded-xl mt-4 bg-white pl-8 pr-10 pt-8 pb-8 gap-3">
          <h1 className="flex text-xl mb-4 gap-1">
            <button
              className="flex items-center justify-center self-start mb-2"
              aria-label="Link"
            >
              <RiAwardFill className="h-8 w-8 hover:bg-slate-100 transition-all hover:rounded-xl p-1 text-primaryColor" />
            </button>
            Google user experience design :D
          </h1>
          <div className="flex gap-3 items-center">
            <p className="">Google</p>
            <span className="text-2xl text-gray-200 font-extralight">|</span>
            <p className="text-sm">2022</p>
          </div>
        </div>
      </div>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No items added</span>
    </div>
  ),
};

const Education_RepeatableFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col pt-5 pb-4 pl-7 pr-28">
      <span className="text-lg font-medium mb-2">{cardTitle}</span>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col w-full h-auto rounded-xl mt-4 bg-white pl-8 pr-10 pt-8 pb-8 gap-3">
          <h1 className="flex text-xl mb-4 gap-1">
            <button
              className="flex items-center justify-center self-start"
              aria-label="Link"
            >
              <FaGraduationCap className="h-8 w-8 hover:bg-slate-100 transition-all hover:rounded-xl p-1 text-primaryColor" />
            </button>
            Google user experience design, School of science
          </h1>
          <div className="flex gap-3 items-center">
            <p className="">Google</p>
            <span className="text-2xl text-gray-200 font-extralight">|</span>
            <p className="text-sm">2022</p>
          </div>
        </div>
        <div className="flex flex-col w-full h-auto rounded-xl mt-4 bg-white pl-8 pr-10 pt-8 pb-8 gap-3">
          <h1 className="text-[22px] font-normal">
            Google user experience design :D
          </h1>
          <div className="flex gap-3 items-center">
            <p className="">Google</p>
            <span className="text-2xl text-gray-200 font-extralight">|</span>
            <p className="text-sm">2022</p>
          </div>
        </div>
      </div>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No items added</span>
    </div>
  ),
};

export const IncrementFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex items-center justify-between py-4 pl-5 pr-8">
      <div className="flex flex-col gap-1">
        <span className="text-lg">{cardTitle}</span>
        <span className="text-2xl mt-4">
          {value as number} year
          {(value as number) > 1 || (value as number) == 0 ? "s" : ""}
        </span>
      </div>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No number set</span>
    </div>
  ),
};

// function extractYouTubeId(url: string) {
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[2].length === 11 ? match[2] : null;
// }

export const VideoFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => {
    const videoUrl = value as string;

    // Check if the URL is a YouTube video
    const isYouTube =
      videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

    // Extract YouTube video ID for thumbnail
    const getYouTubeVideoId = (url: string) => {
      const regex =
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      return match ? match[1] : "";
    };

    const videoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;

    // States
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [thumbnail, setThumbnail] = React.useState<string | null>(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Generate a thumbnail for non-YouTube videos
    const captureThumbnail = (url: string) => {
      const video = document.createElement("video");
      video.src = url;
      video.crossOrigin = "anonymous";
      video.currentTime = 1;

      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL("image/png");
        setThumbnail(thumbnailUrl);
      });
    };

    // Generate thumbnail on mount for non-YouTube videos
    React.useEffect(() => {
      if (!isYouTube) {
        captureThumbnail(videoUrl);
      }
    }, [videoUrl, isYouTube]);

    return (
      <div className="flex flex-col w-full h-auto">
        <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-lg">
          {/* YouTube Video Stylings */}
          {isYouTube && videoId ? (
            <button
              onClick={openModal}
              className="block w-full h-full focus:outline-none"
            >
              <img
                className="w-full h-full object-cover"
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="YouTube Thumbnail"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primaryColor">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9.5 7.5v9l7-4.5-7-4.5z" />
                  </svg>
                </div>
              </div>
            </button>
          ) : (
            // Non-YouTube Video Stylings
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center bg-primaryColor cursor-pointer"
                onClick={openModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9.5 7.5v9l7-4.5-7-4.5z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div
              className="relative bg-primaryColor shadow-2xl max-w-4xl w-full p-7 transform scale-100 transition-all duration-300"
              style={{
                animation: "fadeIn 0.3s ease-in-out",
              }}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute -top-1 -right-1 rounded-full focus:outline-none hover:scale-105 transition-transform bg-transparent"
                style={{
                  padding: "8px",
                }}
              >
                <FaTimes className="h-6 w-6 hover:bg-slate-100 transition-all hover:rounded-xl p-1 text-white hover:text-primaryColor" />
              </button>
              <div className="w-full h-64 sm:h-96 rounded-xl">
                {isYouTube && videoId ? (
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube Video"
                  />
                ) : (
                  <video
                    className="w-full h-full object-cover rounded-lg"
                    controls
                    autoPlay
                  >
                    <source src={videoUrl} type="video/mp4" />
                    <track kind="captions" src="" label="English captions" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-xl font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No video added</span>
    </div>
  ),
};

export const FileFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base font-medium">{value as string}</span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">No file added</span>
    </div>
  ),
};

export const RangeFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex items-center justify-between py-4 pl-5 pr-8">
      <div className="flex flex-col gap-1">
        <span className="text-lg font-medium">{cardTitle}</span>
        <span className="text-2xl font-medium mt-4">
          ${value as number}.00 / hour
        </span>
      </div>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic mt-4">No range set</span>
    </div>
  ),
};

export const CustomFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base font-medium">{value as string}</span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">
        No custom field added
      </span>
    </div>
  ),
};

export const FieldTemplates: Record<string, FieldTemplateState> = {
  text: TextFieldTemplate,
  textArea: TextFieldTemplate,
  number: NumberFieldTemplate,
  repeatable_portfolio: Project_RepeatableFieldTemplate,
  repeatable_workHistory: WorkHistory_RepeatableFieldTemplate,
  repeatable_certificates: Certificate_RepeatableFieldTemplate,
  repeatable_educations: Education_RepeatableFieldTemplate,
  increment: IncrementFieldTemplate,
  video: VideoFieldTemplate,
  file: FileFieldTemplate,
  range: RangeFieldTemplate,
  custom: CustomFieldTemplate,
};
