import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"; // Adjust import based on your setup

interface AvatarListProps {
  photos: string[];
  maxVisible?: number;
}

const AvatarList: React.FC<AvatarListProps> = ({ photos, maxVisible = 4 }) => {
  const shouldShowPlus = photos.length > maxVisible;
  const displayPhotos = shouldShowPlus
    ? photos.slice(0, maxVisible - 1)
    : photos;
  const remainingCount = shouldShowPlus
    ? photos.length - displayPhotos.length
    : 0;

  return (
    <div className="flex items-center -space-x-2">
      {displayPhotos.map((photo, index) => (
        <Avatar
          key={index}
          className="xl:w-8 xl:h-8 lg:w-7 lg:h-7 w-8 h-8 border-2 border-white"
        >
          <AvatarImage src={photo} alt={`Avatar ${index + 1}`} />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      ))}
      {shouldShowPlus && (
        <div className="xl:w-8 xl:h-8 lg:w-7 lg:h-7 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold border-2 border-white">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default AvatarList;
