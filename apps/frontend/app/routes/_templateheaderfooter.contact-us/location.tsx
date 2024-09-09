const Location = () => {
  return (
    <div className="font-['Switzer-Regular'] bg-gradient-to-r from-primaryColor to-[rgba(39,99,138,0.7)] p-6 md:p-12 items-center justify-between grid grid-cols-1 md:grid-cols-[50%,50%] lg:grid-cols-[27%,73%] mb-40 rounded-xl shadow-xl">
      {/* Left side image */}
      <div className="w-full">
        <img
          src="https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg" // Replace this with the actual image URL
          alt="Dubai"
          className="rounded-xl object-cover w-[80%] h-auto border border-white"
        />
      </div>

      {/* Right side content */}
      <div className="w-full text-white grid grid-cols-1 md:grid-cols-[50%,50%] md:gap-10 lg:gap-0 lg:grid-cols-[37%,37%,26%]">
        {/* Top Section */}
        <div className="mt-10 mb-10 md:flex md:flex-col md:gap-32 md:mt-0 md:mb-0">
          <h2 className="md:text-2xl lg:text-4xl">Dubai</h2>
          <p className="text-sm md:text-md lg:text-lg">01:14 PM GMT+4</p>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-24">
          <div className="">
            <p className="text-base md:text-md lg:text-lg mt-1">Location</p>
            <p className="text-sm md:text-base text-[rgb(255,255,255,0.6)]">
              Business Bay
            </p>
          </div>
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 underline hover:no-underline"
          >
            Google Maps
          </a>
        </div>

        <div className="flex flex-col">
          <p className="mt-1">
            <a href="tel:+0547304995" className="underline hover:no-underline">
              +054 73049 95
            </a>
          </p>
          <p>
            <a
              href="mailto:info@mawaheb.mena"
              className="underline hover:no-underline"
            >
              info@mawaheb.mena
            </a>
          </p>
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default Location;
