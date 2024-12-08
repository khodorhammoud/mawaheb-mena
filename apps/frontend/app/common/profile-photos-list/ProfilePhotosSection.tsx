import AvatarList from "../avatar/AvatarList";

type ProfilePhotosSectionProps = {
  label: string; // label that will appear in the page as a title : "Applicants", "Interviewed", etc.
  images: string[]; // Array of image URLs to display. Aafter a bit, images will be taken from the database througha finction, and put in an array, and passed here
  profiles: { id: number }[]; // Array of freelancers or employers, this is what decide how much profiles there are (profile photos)
};

export default function ProfilePhotosSection({
  label,
  images,
  profiles,
}: ProfilePhotosSectionProps) {
  return (
    <div>
      {/* Label and Count */}
      <div className="font-semibold xl:text-base text-sm flex items-center mb-2 gap-1">
        <p>{label}:</p>
        <p>{profiles.length}</p>
      </div>

      {/* Avatar List */}
      <AvatarList photos={images} />
    </div>
  );
}
