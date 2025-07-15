import AvatarList from '../avatar/AvatarList';

type ProfilePhotosSectionProps = {
  label: string; // Section title: "Applicants", "Interviewed", etc.
  profiles: { id: number }[]; // Determines the number of profile photos
  className?: string; // 👈 Make it optional so it's not required every time
};

export default function ProfilePhotosSection({
  label,
  profiles,
  className = '', // 👈 Default to an empty string if no className is provided
}: ProfilePhotosSectionProps) {
  const placeholderImg =
    'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg';
  const photos = Array.from({ length: profiles.length }, () => placeholderImg);
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Label and Count */}
      <div className="font-semibold xl:text-base text-sm flex items-center mb-2 gap-1">
        <p>{label}</p>
      </div>

      {/* Avatar List */}
      <AvatarList photos={photos} />
    </div>
  );
}
