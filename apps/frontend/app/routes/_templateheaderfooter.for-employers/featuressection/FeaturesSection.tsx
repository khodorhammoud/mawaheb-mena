import { useLoaderData } from "@remix-run/react"; // Use loader data from the main loader
import { motion } from "framer-motion";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../common/header/card";

// Define the type for a feature
interface Feature {
  title: string;
  description: string;
}

// Define the structure of the loader data
interface LoaderData {
  features: Feature[]; // Features data type
}

export default function FeaturesSection() {
  // Use the loader data
  const { features } = useLoaderData<LoaderData>();

  return (
    <section className="py-24 mt-[-100px] custom-gradient relative">
      {/* Circle grid overlay */}
      <div className="circle-grid">
        {Array.from({ length: 10000 }).map((_, idx) => (
          <div key={idx} className="circle" />
        ))}
      </div>

      {/* Adjusted to remove container */}
      <div className="flex items-center justify-center mx-10 relative z-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-16 font-['Switzer-Regular']">
          {/* Render features from loader data */}
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white shadow-lg rounded-[10px] border-2 border-slate-300 z-10"
            >
              <CardHeader className="flex items-center justify-center p-4 relative">
                {/* You can add an icon here */}
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="font-bold text-2xl tracking-wider pb-8">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-gray-700 text-base mt-2 pb-8">
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
