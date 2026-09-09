import "./ParticipantAvatar.css";

interface Props {
  name: string;
  department: string;
  avatarSeed: string;
  size?: "sm" | "md" | "lg";
}

export default function ParticipantAvatar({
  name,
  department,
  avatarSeed,
  size = "md",
}: Props) {
  const avatarUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
    avatarSeed
  )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;

  return (
    <div className={`participant participant--${size}`}>
      <div className="participant__avatar-wrap">
        <img
          src={avatarUrl}
          alt={`Avatar for ${name}`}
          className="participant__avatar"
          loading="lazy"
        />
      </div>
      <div className="participant__info">
        <span className="participant__name">{name}</span>
        <span className="participant__dept">{department}</span>
      </div>
    </div>
  );
}
