import { RepeatableInputType } from "../types";
import type { FieldTemplateState, FormStateType } from "../types";
import Or from "~/common/or/Or";
// import { Pencil } from "lucide-react";

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
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">This is filled</span>
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
    <div className="flex flex-col py-4 pl-5 pr-8">
      <span className="text-lg font-medium">{cardTitle}</span>
      <span className="text-base text-gray-400 italic">this is filled</span>
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
          <h1 className="text-[22px] font-normal">
            Google user experience design, School of science
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
    <div className="flex flex-col pt-7 pb-8 pl-7 pr-28">
      <span className="text-lg font-medium mb-2">{cardTitle}</span>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col w-full h-auto rounded-xl mt-4 bg-white pl-8 pr-10 pt-8 pb-8 gap-3">
          <h1 className="text-[22px] font-normal">
            Google user experience design, School of science
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

    // Function to extract YouTube video ID for thumbnails
    const getYouTubeVideoId = (url: string) => {
      const regex =
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      return match ? match[1] : "";
    };

    const videoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;

    return (
      <div className="flex flex-col w-full h-auto">
        <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-lg">
          {isYouTube && videoId ? (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <img
                className="w-full h-full object-cover"
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="YouTube Thumbnail"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-black"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9.5 7.5v9l7-4.5-7-4.5z" />
                  </svg>
                </div>
              </div>
            </a>
          ) : (
            <video
              className="w-full h-full object-cover"
              controls
              poster="https://via.placeholder.com/640x360.png?text=Video+Placeholder"
            >
              <source src={videoUrl} type="video/mp4" />
              <track
                kind="captions"
                src=""
                srcLang="en"
                label="English"
                default
              />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
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

{
  // PORTFOLIO PART
  /* <div className="flex flex-col pt-8 pb-6 pl-7 pr-10">
      <span className="text-lg font-medium">{cardTitle}</span>
      <div className="flex w-full h-auto rounded-xl mt-4 bg-white">
        <div className="h-72 overflow-hidden rounded-l-xl">
          <img
            className="w-full h-full object-cover"
            src="https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
            alt={value as string}
          />
        </div>
        <div className="text-base text-gray-700 pl-6 pr-10 py-8">
          <h1 className="text-lg text-black mb-4"></h1>
          <p className="mb-2 text-sm">
            As a UI/UX freelancer, I successfully redesigned the UI/UX of an
            established e-commerce website, resulting in a significant
            improvement in user engagement and conversion rates.
          </p>
          <ul className="list-disc list-inside text-sm ml-4">
            <li>
              Conducted comprehensive user research and analyzed website
              analytics to identify key pain points and opportunities for
              improvement.
            </li>
            <li>
              Developed detailed wireframes, prototypes, and high-fidelity
              mockups that enhanced the visual appeal and usability of the site.
            </li>
          </ul>
        </div>
      </div>
    </div> */
}

{
  // Work Hisory
  /* <div className="flex flex-col pt-7 pb-8 pl-7 pr-10">
      <span className="text-lg font-medium">{cardTitle}</span>
      <div className="flex flex-col w-full h-auto rounded-xl mt-4 bg-white pl-7 pr-14 pt-7 pb-7 gap-3">
        <h1 className="text-xl">UI UX Designer</h1>
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
      // Line if there is another Work experience
      <div className="flex-grow border border-gray-300 mt-5 mb-1"></div>
      <div className="flex flex-col w-full h-auto rounded-xl mt-4 bg-white pl-7 pr-14 pt-7 pb-7 gap-3">
        <h1 className="text-xl">UI UX Designer</h1>
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
      </div>
    </div> */
}

{
  // Certificates
  /* <div className="flex flex-col pt-7 pb-8 pl-7 pr-28">
      <span className="text-lg font-medium mb-2">{cardTitle}</span>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col w-full h-auto rounded-xl mt-4 bg-white pl-8 pr-10 pt-8 pb-8 gap-3">
          <h1 className="text-[22px] font-normal">
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
    </div> */
}

{
  // Education
  /* <div className="flex flex-col pt-5 pb-4 pl-7 pr-28">
      <span className="text-lg font-medium mb-2">{cardTitle}</span>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col w-full h-auto rounded-xl mt-4 bg-white pl-8 pr-10 pt-8 pb-8 gap-3">
          <h1 className="text-[22px] font-normal">
            Google user experience design, School of science
          </h1>
          <div className="flex gap-3 items-center">
            <p className="">Google</p>
            <span className="text-2xl text-gray-200 font-extralight">|</span>
            <p className="text-sm">2022</p>
          </div>
        </div>
      </div>
    </div> */
}
