import { useLoaderData } from "@remix-run/react";

// Define the types for Mawaheb data
type MawahebTopic = {
  id: string;
  topic: string;
};

type MawahebDescription = {
  id: string;
  description: string;
};

type LoaderData = {
  mawahebSection: {
    mawahebTopics: MawahebTopic[];
    mawahebDescription: MawahebDescription[];
  }[];
};

const MoreAboutMawaheb = () => {
  // Fetch data from loader
  const { mawahebSection } = useLoaderData<LoaderData>();

  // Extract the first Mawaheb item (you can adjust if needed)
  const mawaheb = mawahebSection[0];

  return (
    <section className="grid grid-cols-2 mb-20 font-['Switzer-Regular']">
      {/* First div: Display all MawahebTopics with 2 <br> elements between them */}
      <div className="">
        <p className="text-gray-600 text-lg w-[90%] ml-2 tracking-wider">
          {mawaheb?.mawahebTopics?.map((topic, index) => (
            <span key={topic.id}>
              {topic.topic}
              {index < mawaheb.mawahebTopics.length - 1 && (
                <>
                  <br />
                  <br />
                </>
              )}
            </span>
          )) || "Default topics for Mawaheb."}
        </p>
      </div>

      {/* Second div: Display all MawahebDescription */}
      <div className="">
        <p className="text-2xl w-[90%] ml-6 text-black leading-relaxed">
          {mawaheb?.mawahebDescription?.map((desc) => (
            <span key={desc.id}>
              {desc.description}
              <br />
              <br />
            </span>
          )) || "Default descriptions for Mawaheb."}
        </p>
      </div>
    </section>
  );
};

export default MoreAboutMawaheb;
