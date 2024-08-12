import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

// Sample FAQ data
const faqs = [
  {
    id: 1,
    question: "How does your AI matching tool work?",
    answer:
      "Our AI matching tool analyzes project requirements, freelancer skills, and past performance data to identify the most suitable match for your project. It uses advanced algorithms to ensure precise and efficient matchmaking, saving you time and effort in finding the right freelancer.",
  },
  {
    id: 2,
    question: "What industries do your freelancers specialize in?",
    answer:
      "Our freelancers specialize in a wide range of industries including tech, design, writing, marketing, and more.",
  },
  {
    id: 3,
    question: "How do you ensure the quality of freelancers on your platform?",
    answer:
      "We have a rigorous vetting process that includes reviewing portfolios, conducting interviews, and verifying skills and experience to ensure that we provide top-quality freelancers.",
  },
  {
    id: 4,
    question: "What if I'm not satisfied with the freelancer's work?",
    answer:
      "If you're not satisfied with a freelancer's work, we offer a satisfaction guarantee and will work with you to find a suitable resolution, which may include reworking the project or matching you with a different freelancer.",
  },
  {
    id: 5,
    question: "What are your pricing and payment policies?",
    answer:
      "Our pricing is competitive and transparent. Payments are handled securely through our platform, and we offer various payment options to suit your needs.",
  },
];

const FAQ = () => {
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
    <section className="py-16 mt-[100px]">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2 className="font-bold mb-20 text-6xl font-['BespokeSerif-Regular']">
          FAQS
        </h2>
        <div className="space-y-8">
          {/* Map through the FAQ items */}
          {faqs.map((faq) => (
            <Card
              key={faq.id}
              className="bg-white shadow-lg rounded-[10px] border-[2px] border-slate-300"
            >
              {/* Header of the card with question and toggle icon */}
              <CardHeader
                className="grid grid-cols-[80px_auto_60px] items-center cursor-pointer col-span-2 border-b-[1px] border-slate-200 pb-8"
                onClick={() => toggleFAQ(faq.id)}
              >
                <div className="text-2xl font-bold text-green-600 justify-self-center pt-1">
                  {faq.id < 10 ? `0${faq.id}` : faq.id}
                </div>
                <CardTitle className="text-2xl font-medium flex justify-start items-center pl-2 whitespace-nowrap overflow-hidden">
                  {faq.question}
                </CardTitle>
                <div className="flex justify-end items-center pr-2">
                  {openFAQ === faq.id ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="w-7 h-7 text-green-600"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="w-7 h-7 text-green-600"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5 12h14"
                      />
                    </svg>
                  )}
                </div>
              </CardHeader>
              {/* Conditionally render the answer content with animation */}
              <AnimatePresence initial={false}>
                {openFAQ === faq.id && (
                  <motion.div
                    key={faq.id}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className="overflow-hidden"
                  >
                    <CardContent className="col-start-2 col-end-3 pl-12 pr-10 py-9">
                      <p className="text-gray-700 text-lg">{faq.answer}</p>
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
