import React from "react";

// Define the type for the blog card data
interface BlogCardData {
  image: string;
  name: string;
  mins: string;
  description: string;
  link: string;
}

// Define the blogCards array with the BlogCardData type
const blogCards: BlogCardData[] = [
  {
    image:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    name: "Empowering Local Talent: Layla's Journey",
    mins: "10 mins read",
    description:
      "Layla's story is a testament to the transformative power of opportunity and determination. Starting with basic programming knowledge...",
    link: "hii",
  },
  {
    image:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    name: "Empowering Local Talent: Layla's Journey",
    mins: "10 mins read",
    description:
      "Layla's story is a testament to the transformative power of opportunity and determination. Starting with basic programming knowledge...",
    link: "hii",
  },
  {
    image:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    name: "Empowering Local Talent: Layla's Journey",
    mins: "10 mins read",
    description:
      "Layla's story is a testament to the transformative power of opportunity and determination. Starting with basic programming knowledge...",
    link: "hii",
  },
];

// Define the props type for the BlogCard component
interface BlogCardProps {
  image: string;
  name: string;
  mins: string;
  description: string;
  link: string;
}

// BlogCard component
const BlogCard: React.FC<BlogCardProps> = ({
  image,
  name,
  mins,
  description,
  link,
}) => {
  return (
    <a href={link} className="block border border-gray-300 max-w-sm rounded-xl">
      <img src={image} alt={name} className="rounded-t-xl" />
      <h2 className="text-lg font-semibold mt-4 px-4 leading-5">{name}</h2>
      <p className="text-sm text-gray-600 px-4 mt-1 mb-4">{mins}</p>
      <p className="mt-2 text-gray-700 px-4 leading-tight">{description}</p>
      <a
        href="https://linkedinProfile.com"
        className="text-blue-600 mt-4 inline-block px-4 mb-4"
      >
        Read More &gt;
      </a>
    </a>
  );
};

// BlogCardsList component
const BlogCardsList: React.FC = () => {
  return (
    <div className="flex flex-col items-center lg:flex-row gap-10 xl:gap-20 justify-center my-28">
      {blogCards.map((card, index) => (
        <BlogCard
          key={index}
          image={card.image}
          name={card.name}
          mins={card.mins}
          description={card.description}
          link={card.link}
        />
      ))}
    </div>
  );
};

export default BlogCardsList;
