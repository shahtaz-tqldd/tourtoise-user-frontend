import React from "react";

import { Image } from "@/components/shared/utils";
import { MEDIA_CONTENT_TYPE } from "@/constants/content";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "size-7 text-2xs",
  sm: "size-8 text-caption",
  md: "size-10 text-body-sm",
};

/** Round avatar with an initial fallback. Decorative: the name sits beside it. */
const AuthorAvatar = ({ src, name, size = "md", className }) => (
  <span
    aria-hidden="true"
    className={cn(
      "center shrink-0 overflow-hidden rounded-full bg-accent font-bold text-brand-text",
      SIZES[size],
      className,
    )}
  >
    {src ? (
      <Image src={src} alt="" width={80} content_type={MEDIA_CONTENT_TYPE.USER} />
    ) : (
      name?.trim()?.charAt(0).toUpperCase() || "T"
    )}
  </span>
);

export default AuthorAvatar;
