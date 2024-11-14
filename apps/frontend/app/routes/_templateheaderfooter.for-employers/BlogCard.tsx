import React from "react";
import { useLoaderData } from "@remix-run/react";

// Define the type for the blog card data coming from the loader
interface BlogCardData {
  imageURL: string;
  name: string;
  readFrom: string;
  content: string;
  link: string; // If a link is provided in your CMS model
}

// Define the props type for the BlogCard component
interface BlogCardProps {
  imageURL: string;
  name: string;
  readFrom: string;
  content: string;
  link: string;
}

// BlogCard component
const BlogCard: React.FC<BlogCardProps> = ({
  imageURL,
  name,
  readFrom,
  content,
  link,
}) => {
  return (
    <a href={link} className="block border border-gray-300 max-w-sm rounded-xl">
      <img src={imageURL} alt={name} className="rounded-t-xl" />
      <h2 className="text-lg font-semibold mt-4 px-4 leading-5">{name}</h2>
      <p className="text-sm text-gray-600 px-4 mt-1 mb-4">{readFrom}</p>
      <p className="mt-2 text-gray-700 px-4 leading-tight">{content}</p>
      <a href={link} className="text-blue-600 mt-4 inline-block px-4 mb-4">
        Read More &gt;
      </a>
    </a>
  );
};

// BlogCardsList component
const BlogCardsList: React.FC = () => {
  // Fetch the data from the loader
  const { blogCardSection } = useLoaderData<{
    blogCardSection: BlogCardData[];
  }>();

  return (
    <div className="flex flex-col items-center lg:flex-row gap-10 xl:gap-20 justify-center my-28">
      {blogCardSection.map((card, index) => (
        <BlogCard
          key={index}
          imageURL={card.imageURL}
          name={card.name}
          readFrom={card.readFrom}
          content={card.content}
          link="#"
        />
      ))}
    </div>
  );
};

export default BlogCardsList;
