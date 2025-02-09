import AvatarList from "../avatar/AvatarList";

type ProfilePhotosSectionProps = {
  label: string; // Section title: "Applicants", "Interviewed", etc.
  images: string[]; // Array of image URLs
  profiles: { id: number }[]; // Determines the number of profile photos
  className?: string; // 👈 Make it optional so it's not required every time
};

export default function ProfilePhotosSection({
  label,
  images,
  profiles,
  className = "", // 👈 Default to an empty string if no className is provided
}: ProfilePhotosSectionProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Label and Count */}
      <div className="font-semibold xl:text-base text-sm flex items-center mb-2 gap-1">
        <p>{label}</p>
        <p>{profiles.length}</p>
      </div>

      {/* Avatar List */}
      <AvatarList photos={images} />
    </div>
  );
}
