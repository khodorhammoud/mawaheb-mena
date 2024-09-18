import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GET_SUBHEADLINE_QUERY } from "../../../../../shared/cms-queries";

// Define the type for a subheadline
interface SubHeadline {
  content: string;
}

// Define the type for the GraphQL response
interface SubHeadlineResponse {
  data: {
    forFreelancersSubHeadlines: SubHeadline[]; // This should be an array
  };
}

export default function Headline() {
  const [isVisible, setIsVisible] = useState(true);
  const [subHeadlineContent, setSubHeadlineContent] = useState<string>("");

  useEffect(() => {
    async function fetchSubHeadline() {
      try {
        const res = await fetch("http://localhost:3000/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: GET_SUBHEADLINE_QUERY, // No need for variables, since we're fetching all
          }),
        });

        const json = await res.json();
        console.log(json); // Log the full response

        if (json.data && json.data.forFreelancersSubHeadlines.length > 0) {
          const fetchedContent =
            json.data.forFreelancersSubHeadlines[0].content;
          setSubHeadlineContent(fetchedContent);
        } else {
          console.error("No subheadline found in response");
        }
      } catch (error) {
        console.error("Error fetching subheadline:", error);
      }
    }

    fetchSubHeadline();
    const timeoutId = setTimeout(() => {
      setIsVisible(false);
    }, 1800);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <section className="text-center py-16 bg-white mt-28 relative z-50">
      <div className="container mx-auto px-4 relative">
        <h1 className="text-4xl md:text-6xl font-extrabold font-['BespokeSerif-Regular'] leading-relaxed relative">
          <div className="leading-relaxed">
            Your{" "}
            <span className="bg-black rotation-animation inline-block px-6 md:px-8 rounded-[14px] relative z-[100]">
              {isVisible && (
                <svg
                  className="absolute top-[-110px] -right-28 z-[1000] transition-opacity duration-500 ease-out"
                  width="180"
                  height="110"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    id="swingPath"
                    d="M0 200 Q30 90 100 100 T200 40"
                    stroke="#ddd"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle r="10" fill="black" opacity="0">
                    <animate
                      attributeName="opacity"
                      from="0"
                      to="1"
                      begin="0.1s"
                      dur="0.1s"
                      fill="freeze"
                    />
                    <animateMotion
                      begin="0.05s"
                      dur="2.6s"
                      repeatCount="1"
                      keyPoints="1;0"
                      rotate="auto"
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href="#swingPath" />
                    </animateMotion>
                    <animate
                      attributeName="opacity"
                      from="1"
                      to="0"
                      begin="2.6s"
                      dur="0.05s"
                      fill="freeze"
                    />
                  </circle>
                </svg>
              )}
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
          <p className="pt-7 text-lg mt-4 text-black font-['Switzer-Regular'] max-w-[500px] mx-auto text-center">
            {subHeadlineContent}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
