import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const testimonialsData = [
  {
    icon: `<svg width="512" height="512" viewBox="0 0 512 512" style="color:currentColor" xmlns="http://www.w3.org/2000/svg" class="h-full w-full"><rect width="512" height="512" x="0" y="0" rx="30" fill="transparent" stroke="transparent" stroke-width="0" stroke-opacity="100%" paint-order="stroke"></rect><svg width="256px" height="256px" viewBox="0 0 48 48" fill="currentColor" x="128" y="128" role="img" style="display:inline-block;vertical-align:middle" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><mask id="ipTMaslowPyramids0"><g fill="none" stroke="#fff" stroke-width="4"><path fill="#555" fill-rule="evenodd" stroke-linejoin="round" d="m24 4l-9 15.98h18L24 4Z" clip-rule="evenodd"/><path stroke-linecap="round" d="M24 19.98L24.008 44"/><path stroke-linecap="round" stroke-linejoin="round" d="M11.347 25.975L2 42h15.005"/><path stroke-linecap="round" d="M9.1 30.995h7.904"/><path stroke-linecap="round" stroke-linejoin="round" d="M36.748 25.975L46.094 42H31"/><path stroke-linecap="round" d="M39.094 30.995H31.1"/></g></mask><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipTMaslowPyramids0)"/></g></svg></svg>`,
    opinion: `"Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text"`,
    img: "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    name: "Rachelle Assad",
    role: "CEO, Asaad for Construction",
  },
  {
    icon: `<svg width="512" height="512" viewBox="0 0 512 512" style="color:currentColor" xmlns="http://www.w3.org/2000/svg" class="h-full w-full"><rect width="512" height="512" x="0" y="0" rx="30" fill="transparent" stroke="transparent" stroke-width="0" stroke-opacity="100%" paint-order="stroke"></rect><svg width="256px" height="256px" viewBox="0 0 48 48" fill="currentColor" x="128" y="128" role="img" style="display:inline-block;vertical-align:middle" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m24 15.94l-3.5 3.5h-4.94v4.95l-3.5 3.5l3.5 3.49v4.95h4.94l3.5 3.5l3.5-3.5h4.94v-4.95l3.5-3.49l-3.5-3.5v-4.95H27.5Zm14.36-9.75h-1.07a1.79 1.79 0 0 0-3.57 0H14.3a1.79 1.79 0 0 0-3.57 0H9.66A2.88 2.88 0 0 0 6.76 9v3.68h34.48V9.06a2.87 2.87 0 0 0-2.86-2.87Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M41.24 12.71H6.76v28a2.85 2.85 0 0 0 2.86 2.86h28.74a2.86 2.86 0 0 0 2.88-2.85h0Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M28.47 30.9A5.39 5.39 0 0 0 24 22.5m-4.47 2.37A5.4 5.4 0 0 0 24 33.28"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24 23.33v2.03l-2.79-2.79L24 19.79h0v3.54zm0 9.11v-2.02l2.79 2.78L24 35.99v-3.55z"/></g></svg></svg>`,
    opinion: `"There are many variations of passages of Lorem Ipsum available, but the majority have injected humour"`,
    img: "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    name: "Sarah Johnson",
    role: "CEO, Tech Innovators Inc",
  },
  {
    icon: `<svg width="512" height="512" viewBox="0 0 512 512" style="color:currentColor" xmlns="http://www.w3.org/2000/svg" class="h-full w-full"><rect width="512" height="512" x="0" y="0" rx="30" fill="transparent" stroke="transparent" stroke-width="0" stroke-opacity="100%" paint-order="stroke"></rect><svg width="256px" height="256px" viewBox="0 0 24 24" fill="currentColor" x="128" y="128" role="img" style="display:inline-block;vertical-align:middle" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 19a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5ZM10 5l2-2m-4.5 7a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5Zm.5 6l8-8M5.5 21a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5Zm13-13a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5ZM12 21l2-2"/></g></svg></svg>`,
    opinion: `"Various desktop publishing packages and web page editors now use Lorem Ipsum as their default model text."`,
    img: "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    name: "Michael Scott",
    role: "Regional Manager, Dunder Mifflin",
  },
];

interface TestimonialsProps {
  onSwipe: () => void; // Function to hide the finger icon on swipe
}

const Testimonials: React.FC<TestimonialsProps> = ({ onSwipe }) => {
  const [[currentIndex, direction], setCurrentIndex] = useState<
    [number, number]
  >([0, 0]);

  const handleDragEnd = (_: any, info: any) => {
    const swipeThreshold = 10; // Lower threshold for more sensitivity
    const dragDistance = info.offset.x;

    if (dragDistance < -swipeThreshold) {
      // Swiping to the left
      if (currentIndex === testimonialsData.length - 1) {
        setCurrentIndex([0, 1]); // Go back to the first testimonial
      } else {
        setCurrentIndex([currentIndex + 1, 1]);
      }
    } else if (dragDistance > swipeThreshold) {
      // Swiping to the right
      if (currentIndex === 0) {
        setCurrentIndex([testimonialsData.length - 1, -1]); // Go to the last testimonial
      } else {
        setCurrentIndex([currentIndex - 1, -1]);
      }
    }

    onSwipe(); // Hide the icon when the user interacts with the testimonials
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto text-center select-none">
      {/* Swiper */}
      <div className="overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          {testimonialsData.map(
            (testimonial, index) =>
              currentIndex === index && (
                <motion.div
                  key={index}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                  transition={{ duration: 0.5 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2} // Lower elastic value for more responsive dragging
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 flex flex-col items-center text-center p-4 w-full font-['Switzer-Regular']"
                >
                  <div className="w-28 h-28 text-black mb-16">
                    <div
                      dangerouslySetInnerHTML={{ __html: testimonial.icon }}
                    />
                  </div>
                  <p className="text-black font-light text-3xl tracking-wide mb-20 w-[800px]">
                    {testimonial.opinion}
                  </p>
                  <div className="flex gap-8 w-[300px] md:w-[600px] lg:w-[700px]">
                    <img
                      src={testimonial.img}
                      alt={testimonial.name}
                      className="w-32 h-32 rounded-full"
                    />
                    <div className="flex flex-col justify-center">
                      <h3 className="text-2xl font-semibold text-left">
                        {testimonial.name}
                      </h3>
                      <p className="text-black text-2xl font-normal">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div className="relative w-full">
                    <div className="relative w-full h-2 bg-gray-200 mt-10 rounded-sm">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-500"
                        style={{
                          width: `${((currentIndex + 1) / testimonialsData.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>

      {/* Progress Line */}
    </div>
  );
};

export default Testimonials;
