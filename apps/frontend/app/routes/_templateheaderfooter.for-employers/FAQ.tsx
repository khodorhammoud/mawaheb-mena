import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../common/header/card";
import { motion, AnimatePresence } from "framer-motion";

interface FAQ {
  faqNb: number;
  faqQuestion: string;
  faqAnswer: string;
}

interface LoaderData {
  faqSection: FAQ[];
}

const FAQ = () => {
  // call the loader by the useLoaderData
  const { faqSection } = useLoaderData<LoaderData>();

  const [openFAQ, setOpenFAQ] = useState<number | null>(1);

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  // Define variants for the FAQ content
  const variants = {
    hidden: {
      opacity: 0,
      height: 0,
      overflow: "hidden",
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      height: "auto",
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      scale: 0.95,
      overflow: "hidden",
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2 className="font-bold mb-20 mt-40 text-6xl font-['BespokeSerif-Regular']">
          FAQS
        </h2>
        <div className="space-y-8">
          {/* Map through the FAQ items */}
          {faqSection.map((faq) => (
            <Card
              key={faq.faqNb} // faq number
              className="bg-white shadow-lg rounded-[10px] border-[2px] border-slate-300"
            >
              {/* Header of the card with question and toggle icon */}
              <CardHeader
                className="grid grid-cols-[80px_auto_60px] items-center cursor-pointer col-span-2 border-b-[1px] border-slate-200 pb-8"
                onClick={() => toggleFAQ(faq.faqNb)} // faq number
              >
                <div className="text-2xl font-bold text-primaryColor justify-self-center pt-1">
                  {faq.faqNb < 10 ? `0${faq.faqNb}` : faq.faqNb}
                  {/* faq number */}
                </div>
                <CardTitle className="text-2xl font-medium flex justify-start items-center pl-2 overflow-hidden">
                  {faq.faqQuestion}
                  {/* faq question */}
                </CardTitle>
                <div className="flex justify-end items-center pr-2">
                  {openFAQ === faq.faqNb ? ( // faq number
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-7 h-7 text-primaryColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-7 h-7 text-primaryColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14"
                      />
                    </svg>
                  )}
                </div>
              </CardHeader>
              {/* Conditionally render the answer content with animation */}
              <AnimatePresence initial={false}>
                {openFAQ === faq.faqNb && (
                  // faq number
                  <motion.div
                    key={faq.faqNb}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className="overflow-hidden"
                  >
                    <CardContent className="col-start-2 col-end-3 pl-12 pr-10 py-9">
                      <p className="text-gray-800 text-lg">{faq.faqAnswer}</p>
                      {/* faq answer */}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
