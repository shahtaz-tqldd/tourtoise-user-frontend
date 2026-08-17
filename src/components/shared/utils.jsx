import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Globe, Sparkles, User } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { BoxIcon } from "@/assets/icons/svg-icons";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { MEDIA_CONTENT_TYPE } from "@/constants/content";

const renderRichMessage = (message) => {
  const normalizedMarkdown = String(message ?? "").replace(
    /\*\*[ \t]+(.+?)[ \t]+\*\*/g,
    "**$1**",
  );

  return DOMPurify.sanitize(marked.parse(normalizedMarkdown));
};

export const AuthorMessage = ({
  message,
  title = null,
  component = null,
  className = "",
  author = "turtle",
  renderHtml = false,
}) => {
  return (
    <div className={cn("flex gap-3 w-fit md:max-w-[88%]", className)}>
      <div className="mt-1 flex h-8 w-8 shrink-0">
        <img src="/logo.png" className="h-full object-contain" />
      </div>
      <div className="bg-primary/10 rounded-xl px-4 py-3 rounded-tl-md">
        <span className="text-primary font-semibold text-xs uppercase tracking-wider">
          {author}
        </span>
        {title && (
          <h3 className="text-sm font-semibold text-slate-950 mb-1">{title}</h3>
        )}
        {renderHtml ? (
          <div
            className="text-sm md:leading-6 text-slate-700 [&_p+p]:mt-2 [&_strong]:font-bold"
            dangerouslySetInnerHTML={{
              __html: renderRichMessage(message),
            }}
          />
        ) : (
          <p className="text-sm md:leading-6 text-slate-700">{message}</p>
        )}
        {component && component}
      </div>
    </div>
  );
};

export const NotificationCard = ({
  message,
  title = null,
  icon = Sparkles,
}) => {
  const Icon = icon;

  return (
    <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="center mt-0.5 size-8 shrink-0 rounded-full bg-white text-primary">
          <Icon size={17} />
        </div>

        <div>
          {title && (
            <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
          )}
          <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export const Logo = ({ className = "flex" }) => {
  return (
    <Link
      to="/"
      className={cn("items-center gap-2", className)}
      aria-label="tourtoise"
    >
      <img src="/logo.png" className="h-7 md:h-8" alt="" />
      <span className="min-w-0">
        <span className="block md:pt-1 truncate text-xl md:text-2xl logo-font font-bold text-primary">
          tourtoise
        </span>
      </span>
    </Link>
  );
};

export const PageTitle = ({
  title,
  text,
  variant = "dark",
  className = "",
}) => {
  return (
    <div className={className}>
      <h1
        className={cn(
          "text-xl md:text-2xl font-bold",
          variant === "dark" ? "text-slate-800" : "text-white",
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          "mt-1.5 max-w-xl text-sm md:text-base md:leading-7",
          variant === "dark" ? "text-slate-600" : "text-slate-200",
        )}
      >
        {text}
      </p>
    </div>
  );
};

export const SectionHeader = ({
  title,
  description,
  icon = null,
  className = "",
}) => (
  <div className={cn("flex items-start justify-between gap-4", className)}>
    <div className="flex gap-3">
      {icon && (
        <div className="hidden md:flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {React.createElement(icon, { size: 20 })}
        </div>
      )}
      <div>
        <h2 className="font-bold text-slate-950">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[13px] text-slate-500 line-clamp-1">
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
);

export const EmptyState = ({ title, description, onClear, className = "" }) => (
  <div
    className={cn(
      "bg-white text-center flex flex-col items-center rounded-3xl px-10 py-24",
      className,
    )}
  >
    <BoxIcon size={12} />
    <h2 className="mt-4 font-semibold text-slate-950 text-base">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
      {description}
    </p>
    {onClear && (
      <Button className="mt-4" variant="outline" onClick={onClear}>
        Clear filters
      </Button>
    )}
  </div>
);

export const VisibilityStatus = ({ visibility }) => {
  const isPrivate = visibility === "private";
  return (
    <span
      className={cn(
        "flx gap-1 rounded-md bg-slate-100 ring pl-2 pr-2.5 py-1 text-xs font-semibold capitalize",
        isPrivate
          ? "bg-slate-100 ring-slate-200 text-slate-700"
          : "bg-green-100 ring-green-200 text-green-700",
      )}
    >
      {isPrivate ? (
        <User size={12} strokeWidth={2.5} />
      ) : (
        <Globe size={12} strokeWidth={2} />
      )}
      {visibility}
    </span>
  );
};

const getFallbackImage = (type = MEDIA_CONTENT_TYPE.ATTRACTION) => {
  switch (type) {
    case MEDIA_CONTENT_TYPE.ATTRACTION:
      return "/fallback_attraction.webp";

    case MEDIA_CONTENT_TYPE.CUISINE:
      return "/fallback_cuisine.webp";

    case MEDIA_CONTENT_TYPE.ACTIVITY:
      return "/fallback_activity.webp";

    case MEDIA_CONTENT_TYPE.USER:
      return "/fallback_user.webp";

    default:
      return "/fallback_attraction.webp";
  }
};

const getPreviewURL = (
  url,
  width,
  content_type = MEDIA_CONTENT_TYPE.ATTRACTION,
) => {
  if (!url) {
    return getFallbackImage(content_type);
  }

  if (!url.includes("res.cloudinary.com")) {
    return url;
  }

  const uploadPath = "/image/upload/";
  const [baseUrl, imagePath] = url.split(uploadPath);

  if (!baseUrl || !imagePath) {
    return url;
  }

  // Avoid applying the transformation multiple times
  if (imagePath.startsWith("c_scale,")) {
    return url;
  }

  return `${baseUrl}${uploadPath}c_scale,w_${width}/${imagePath}`;
};

export const Image = ({
  src,
  alt = "",
  width = 360,
  className,
  onLoad,
  onError,
  decoding = "async",
  content_type = MEDIA_CONTENT_TYPE.ATTRACTION,
  ...props
}) => {
  const fallbackImage = getFallbackImage(content_type);
  const previewUrl = getPreviewURL(src, width, content_type);
  const [loadedUrl, setLoadedUrl] = React.useState(null);
  const isLoaded = loadedUrl === previewUrl;

  const handleImageLoad = (event) => {
    setLoadedUrl(previewUrl);
    onLoad?.(event);
  };

  const handleImageError = (event) => {
    onError?.(event);

    // Prevent an infinite onError loop if the fallback also fails.
    if (event.currentTarget.src.endsWith(fallbackImage)) {
      return;
    }

    event.currentTarget.src = fallbackImage;
  };

  return (
    <img
      src={previewUrl}
      alt={alt}
      decoding={decoding}
      onLoad={handleImageLoad}
      onError={handleImageError}
      className={cn(
        "h-full w-full object-cover",
        !isLoaded && "bg-slate-200 text-transparent motion-safe:animate-pulse",
        className,
      )}
      {...props}
    />
  );
};
