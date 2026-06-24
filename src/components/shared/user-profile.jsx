import { cn, getCloudinaryPreviewUrl, getInitials } from "@/lib/utils";
import { useSelector } from "react-redux";

export const UserAvatar = ({ className = "size-7" }) => {
  const { user } = useSelector((state) => state.auth);
  const fullName = user?.name || "Guest User";
  const profileImage = user?.avatar_url;

  return (
    <div className="relative center" aria-label="Profile">
      {profileImage ? (
        <img
          src={getCloudinaryPreviewUrl(profileImage, 36)}
          className={cn("rounded-full object-cover", className)}
          alt={fullName}
        />
      ) : (
        <span
          className={cn(
            "center rounded-full text-xs font-bold bg-primary text-white",
            className,
          )}
        >
          {getInitials(fullName)}
        </span>
      )}
    </div>
  );
};
