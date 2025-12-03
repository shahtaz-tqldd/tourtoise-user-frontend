import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

const Container = ({
  children,
  style,
  className = "",
}: {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) => {
  return (
    <section className={cn("py-20", className)} style={style}>
      <div className="max-w-[1280px] mx-auto">{children}</div>
    </section>
  );
};

export default Container;
