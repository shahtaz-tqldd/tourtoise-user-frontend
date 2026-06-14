import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

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

export const AuthorMessage = ({ message, title = null, author = "turtle" }) => {
  return (
    <div className="flex gap-3 max-w-[88%]">
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
        <p className="text-sm leading-6 text-slate-700">{message}</p>
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
