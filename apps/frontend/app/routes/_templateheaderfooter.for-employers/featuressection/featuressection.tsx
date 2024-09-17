import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";
import { GET_FEATURES_QUERY } from "../../../../../cms/graphql/queries";

// Step 1: Define the type for a feature
interface Feature {
  title: string;
  description: string;
}

export default function FeaturesSection() {
  // Step 2: Type the state with Feature[]
  const [features, setFeatures] = useState<Feature[]>([]);

  // Step 3: Fetch data in useEffect with proper types
  useEffect(() => {
    async function fetchFeatures() {
      try {
        const res = await fetch("http://localhost:3000/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: GET_FEATURES_QUERY,
          }),
        });

        const json = await res.json();
        console.log("Fetched data: ", json); // This should print your data to the console

        if (json.data && json.data.features) {
          setFeatures(json.data.features as Feature[]);
          console.log("Features state: ", json.data.features); // Log the data being set to state
        } else {
          console.error("No features found in response");
        }
      } catch (error) {
        console.error("Error fetching features:", error);
      }
    }

    fetchFeatures();
  }, []);

  return (
    <section className="py-24 mt-[-100px] custom-gradient relative">
      {/* Circle grid overlay */}
      <div className="circle-grid">
        {Array.from({ length: 5000 }).map((_, idx) => (
          <div key={idx} className="circle" />
        ))}
      </div>

      <div className="container px-10 relative z-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-16 font-['Switzer-Regular']">
          {/* Step 4: Render features from state */}
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white shadow-lg rounded-[10px] border-2 border-slate-300 z-10"
            >
              <CardHeader className="flex items-center justify-center p-4 relative">
                {/* Icon could be added here */}
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="font-bold text-2xl tracking-wider pb-8">
                  {feature.title}{" "}
                  {/* Use Title if capitalized in your schema */}
                </CardTitle>
                <CardDescription className="text-gray-700 text-base mt-2 pb-8">
                  {feature.description} {/* Use Description if capitalized */}
                </CardDescription>
              </CardContent>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
