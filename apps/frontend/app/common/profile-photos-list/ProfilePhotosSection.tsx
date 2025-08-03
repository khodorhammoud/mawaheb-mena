import AvatarList from '../avatar/AvatarList';

type ProfilePhotosSectionProps = {
  label: string;
  profiles: { id: number; profile?: { image?: string } }[];
  className?: string;
};

export default function ProfilePhotosSection({
  label,
  profiles,
  className = '',
}: ProfilePhotosSectionProps) {
  const defaultAvatarUrl =
    'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg';

  // If no profiles, show the empty state
  if (!profiles || profiles.length === 0) {
    return (
      <div className={`flex flex-col items-start ${className}`}>
        <div className="font-semibold flex items-center gap-1">
          <p className="xl:text-sm text-xs">{label}</p>
          <p className="xl:text-sm text-xs">0</p>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {label === 'Applicants'
            ? 'No applicants yet'
            : label === 'Interviewed'
              ? 'No interviewed yet'
              : 'No hired yet'}
        </p>
      </div>
    );
  }

  // Else, show avatars
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="font-semibold flex items-center mb-2 gap-1">
        <p className="xl:text-sm text-xs">{label}</p>
        <p className="xl:text-sm text-xs">{profiles.length}</p>
      </div>
      <AvatarList photos={profiles.map(p => p.profile?.image || defaultAvatarUrl)} />
    </div>
  );
}
