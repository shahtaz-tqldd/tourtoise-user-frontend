import { cn } from "@/lib/utils";

/**
 * Typography primitives. Each maps to one step of the type scale defined in
 * src/styles/tokens.css, so sizes/leading/tracking stay consistent.
 *
 *   <Display size="lg">          hero headlines
 *   <Heading level={1..4}>       page & section titles (renders h1–h4)
 *   <Text size="lg|md|sm|xs">    running copy
 *   <Eyebrow>                    small uppercase label above a heading
 */

const DISPLAY_SIZES = {
  xl: "text-display md:text-display-lg lg:text-display-xl",
  lg: "text-h1 md:text-display lg:text-display-lg",
  md: "text-h1 md:text-display",
};

export function Display({ as: Tag = "h1", size = "lg", className, ...props }) {
  return (
    <Tag
      className={cn("font-display text-heading", DISPLAY_SIZES[size], className)}
      {...props}
    />
  );
}

const HEADING_SIZES = {
  1: "text-h2 md:text-h1",
  2: "text-h3 md:text-h2",
  3: "text-h4 md:text-h3",
  4: "text-body-md md:text-h4 font-bold",
};

export function Heading({ level = 2, as, className, ...props }) {
  const Tag = as || `h${level}`;

  return (
    <Tag
      className={cn("font-display text-heading", HEADING_SIZES[level], className)}
      {...props}
    />
  );
}

const TEXT_SIZES = {
  lg: "text-body-md md:text-body-lg",
  md: "text-body-sm md:text-body-md",
  sm: "text-caption md:text-body-sm",
  xs: "text-caption",
};

const TEXT_TONES = {
  body: "text-body",
  subtle: "text-subtle",
  faint: "text-faint",
  heading: "text-heading",
  brand: "text-brand-text",
  inverse: "text-white/80",
};

export function Text({
  as: Tag = "p",
  size,
  variant,
  tone = "body",
  className,
  ...props
}) {
  return (
    <Tag
      className={cn(TEXT_SIZES[size || variant || "md"], TEXT_TONES[tone], className)}
      {...props}
    />
  );
}

export function Eyebrow({ as: Tag = "p", tone = "brand", className, ...props }) {
  return (
    <Tag
      className={cn(
        "text-overline uppercase",
        tone === "brand" ? "text-brand-text" : "text-white/80",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Legacy heading API (variant xl → xxs). Kept so existing screens keep working;
 * prefer <Heading level> for new code.
 */
const TITLE_SIZES = {
  xl: "text-h2 md:text-display",
  lg: "text-h3 md:text-h2",
  md: "text-h4 md:text-h3",
  sm: "text-body-md md:text-h4 font-bold",
  xs: "text-body-sm md:text-body-md font-semibold",
  xxs: "text-caption md:text-body-sm font-bold",
};

export function Title({ as: Tag = "h2", variant = "md", className, ...props }) {
  return (
    <Tag
      className={cn("font-display text-heading", TITLE_SIZES[variant], className)}
      {...props}
    />
  );
}
