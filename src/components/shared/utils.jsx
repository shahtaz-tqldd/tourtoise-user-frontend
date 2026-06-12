import { cn } from "@/lib/utils";

export const DetailPill = ({ children, className }) => {
  if (!children) return null;

  return (
    <span
      className={cn(
        "rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold capitalize text-slate-800 shadow-sm",
        className,
      )}
    >
      {children}
    </span>
  );
};
