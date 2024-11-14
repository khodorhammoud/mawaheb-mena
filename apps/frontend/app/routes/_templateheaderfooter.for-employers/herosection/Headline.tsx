import { motion } from "framer-motion";
import { useLoaderData } from "@remix-run/react"; // Import useLoaderData

// Define the type for a subheadline
interface SubHeadline {
  content: string;
}

// Define the loader response structure (which includes subheadline)
interface LoaderData {
  subHeadline: SubHeadline;
}

// Headline component
export default function Headline() {
  // UseLoaderData to get subHeadline from the loader
  const { subHeadline } = useLoaderData<LoaderData>();

  return (
    <section className="text-center py-16 bg-white mt-28 relative z-50">
      <div className="container mx-auto px-4 relative">
        <h1 className="text-4xl md:text-6xl font-extrabold font-['BespokeSerif-Regular'] leading-relaxed relative">
          <div className="leading-relaxed">
            Your{" "}
            <span className="bg-black rotation-animation inline-block px-6 md:px-8 rounded-[14px] relative z-[100]">
              <span className="text-white inline-block -rotate-3">Gateway</span>
            </span>{" "}
            to{" "}
          </div>
          <div className="mt-2">Digital Excellence</div>
        </h1>

        <motion.div
          initial={{ y: "100vh" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 70, damping: 20 }}
        >
          {/* Display the subheadline content */}
          <p className="pt-7 text-lg mt-4 text-black font-['Switzer-Regular'] max-w-[500px] mx-auto text-center">
            {subHeadline?.content || "Loading..."}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
