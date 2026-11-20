import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import { Image } from "@/components/shared/utils";
import { MEDIA_CONTENT_TYPE } from "@/constants/content";

const ProfileBar = ({ className, ...props }) => {
  const { user } = useSelector((state) => state.auth);
  const fullName = user?.name || "Traveler";
  const username = user?.username;
  const profileImage = user?.avatar_url;
  const profilePath = `/profile/${username || "my-profile"}`;
  const isPremium = user?.status === "PREMIUM";

  return (
    <Link
      href={profilePath}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-line bg-surface-subtle p-3 transition hover:border-primary/25 hover:bg-accent",
        className,
      )}
      {...props}
    >
      {profileImage ? (
        <Image
          src={profileImage}
          width={80}
          className="size-11 rounded-full ring-2 ring-white"
          content_type={MEDIA_CONTENT_TYPE.USER}
        />
      ) : (
        <span className="center size-11 shrink-0 rounded-full bg-primary/15 text-body-sm font-bold text-primary ring-2 ring-white">
          {getInitials(fullName)}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-sm font-semibold text-heading">
          {fullName}
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate text-caption font-medium",
            isPremium ? "text-primary" : "text-body",
          )}
        >
          {isPremium ? "Premium member" : `${user?.credit ?? 0} credits left`}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-faint" />
    </Link>
  );
};

export default ProfileBar;
