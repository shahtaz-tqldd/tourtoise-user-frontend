import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { cn, getInitials } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Image } from "@/components/shared/utils";

const ProfileBar = ({ className, ...props }) => {
  const { user } = useSelector((state) => state.auth);
  const fullName = user?.name || "Guest User";
  const username = user?.username;
  const profileImage = user?.avatar_url;
  const profilePath = `/profile/${username || "my-profile"}`;
  const isPremium = user?.status === "PREMIUM";

  return (
    <Link
      to={profilePath}
      className={cn(
        "mt-auto flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-primary/25 hover:bg-primary/5",
        className,
      )}
      {...props}
    >
      {profileImage ? (
        <Image
          src={profileImage}
          width={80}
          className="size-11 rounded-full ring-2 ring-white"
        />
      ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-2 ring-white">
          {getInitials(fullName)}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-950">
          {fullName}
        </span>
        {isPremium ? (
          <span className="block mt-1 truncate text-xs font-medium text-primary">
            Premium User
          </span>
        ) : (
          <span className="block mt-1 truncate text-xs text-slate-600 font-medium">
            {user?.credit} Credit Balance
          </span>
        )}
      </span>
      <ChevronRight className="size-4 shrink-0 text-slate-400" />
    </Link>
  );
};

export default ProfileBar;
