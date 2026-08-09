import { cn, getInitials } from "@/lib/utils";
import { useSelector } from "react-redux";
import { Image } from "./utils";

export const UserAvatar = ({ className = "size-7" }) => {
  const { user } = useSelector((state) => state.auth);
  const fullName = user?.name || "Guest User";
  const profileImage = user?.avatar_url;

  return (
    <div className="relative center" aria-label="Profile">
      {profileImage ? (
        <Image
          src={profileImage}
          width={40}
          className={cn("rounded-full", className)}
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
