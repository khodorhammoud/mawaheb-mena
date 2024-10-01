import { useLoaderData } from "@remix-run/react";
import MainHeading from "../../common/MainHeading";

interface WhyWorkWithUs {
  title: string;
  description: string;
}

interface LoaderData {
  whyWorkWithUsSection: WhyWorkWithUs[]; // Expect an array of objects
}

export default function WhayWorkWithUs() {
  // Fetch the data using useLoaderData hook
  const { whyWorkWithUsSection } = useLoaderData<LoaderData>();

  // Log the fetched data to ensure it's coming through correctly
  console.log("whyWorkWithUs in Component:", whyWorkWithUsSection);

  // Check if we have data and if there is at least one item in the array
  if (!whyWorkWithUsSection || whyWorkWithUsSection.length === 0) {
    return <div>Loading...</div>; // Fallback in case of no data
  }

  // Extract the first item from the array (if you're only displaying the first object)
  const { title, description } = whyWorkWithUsSection[0];

  return (
    <MainHeading
      title={title} // Dynamically pass title from data
      description={description} // Dynamically pass description from data
    />
  );
}
