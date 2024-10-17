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

  // Extract the first item from the array (if you're only displaying the first object)
  const { title, description } = whyWorkWithUsSection[0];

  return (
    <MainHeading
      title={title} // Dynamically pass title from data
      description={description} // Dynamically pass description from data
    />
  );
}
