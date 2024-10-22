import React from "react";
import { useLoaderData } from "@remix-run/react";
import { Location as LocationType } from "../../types/PageContent"; // Import Location interface

const Location = () => {
  // Get the location data from the loader
  const { locationSection } = useLoaderData<{
    locationSection: LocationType[];
  }>();

  // Assuming you're using the first location item
  const location = locationSection[0]; // if this page is not oppening, use the below comment insetead of the line in the left
  // const location = locationSection[0] || {};

  return (
    <div className="font-['Switzer-Regular'] bg-gradient-to-r from-primaryColor to-[rgba(39,99,138,0.7)] p-6 md:p-12 items-center justify-between grid grid-cols-1 md:grid-cols-[50%,50%] lg:grid-cols-[27%,73%] mb-40 rounded-xl shadow-xl">
      {/* Left side image */}
      <div className="w-full">
        <img
          src={
            location.imageUrl ||
            "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
          }
          alt={location.location || "Location Image"}
          className="rounded-xl object-cover w-[80%] h-auto border border-white"
        />
      </div>

      {/* Right side content */}
      <div className="w-full text-white grid grid-cols-1 md:grid-cols-[50%,50%] md:gap-10 lg:gap-0 lg:grid-cols-[37%,37%,26%]">
        {/* Top Section */}
        <div className="mt-10 mb-10 md:flex md:flex-col md:gap-32 md:mt-0 md:mb-0">
          <h2 className="md:text-2xl lg:text-4xl">
            {location.location || "Location"}
          </h2>
          <p className="text-sm md:text-md lg:text-lg">
            {location.localTime || "Local Time"}
          </p>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-24">
          <div className="">
            <p className="text-base md:text-md lg:text-lg mt-1">Location</p>
            <p className="text-sm md:text-base text-[rgb(255,255,255,0.6)]">
              {location.area || "Area"}
            </p>
          </div>
          <a
            href={location.googleMapsLink || "https://www.google.com/maps"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 underline hover:no-underline"
          >
            Google Maps
          </a>
        </div>

        <div className="flex flex-col">
          <p className="mt-1">
            <a
              href={`tel:${location.contactNumber || ""}`}
              className="underline hover:no-underline"
            >
              {location.contactNumber || "Contact Number"}
            </a>
          </p>
          <p>
            <a
              href={`mailto:${location.email || ""}`}
              className="underline hover:no-underline"
            >
              {location.email || "Email"}
            </a>
          </p>
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default Location;
