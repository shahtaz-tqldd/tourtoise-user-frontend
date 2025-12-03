import React from "react";
import clsx from "clsx";

export type TypographySize = "xxl" | "xl" | "base" | "sm" | "xs";

interface TypographyProps {
  children: React.ReactNode;
  size?: TypographySize;
  as?: React.ElementType;
  className?: string;
}

const sizeClasses: Record<TypographySize, string> = {
  xxl: "text-3xl md:text-5xl",
  xl: "text-2xl md:text-4xl",
  base: "text-base md:text-xl",
  sm: "text-sm md:text-base",
  xs: "text-xs md:text-sm",
};

export const Typography: React.FC<TypographyProps> = ({
  children,
  size = "base",
  as: Component = "p",
  className,
}) => {
  const isHeading = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(
    Component as string
  );
  const weightClass = isHeading ? "font-semibold" : "font-normal";
  const isParagraph = Component === "p";
  const opacityClass = isParagraph ? "text-gray-500" : "text-gray-700";

  return (
    <Component
      className={clsx(sizeClasses[size], weightClass, opacityClass, className)}
    >
      {children}
    </Component>
  );
};
