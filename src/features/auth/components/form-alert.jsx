import { cn } from "@/lib/utils";

/** Inline success / error message used by the auth forms. */
const FormAlert = ({ tone = "error", children, className }) => {
  if (!children) return null;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-3 py-2.5 text-center text-caption font-medium",
        tone === "error"
          ? "error-bounce border-danger/20 bg-danger-soft text-danger"
          : "border-success/20 bg-success-soft text-success",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const OrDivider = () => (
  <div className="flex items-center gap-3" aria-hidden="true">
    <div className="h-px flex-1 bg-line" />
    <span className="text-overline uppercase text-faint">Or</span>
    <div className="h-px flex-1 bg-line" />
  </div>
);

/** "Don't have an account? Create one" footer line. */
export const SwitchPrompt = ({ prompt, action, onClick }) => (
  <p className="text-center text-body-sm text-subtle">
    {prompt}{" "}
    <button
      type="button"
      onClick={onClick}
      className="font-semibold text-primary hover:underline"
    >
      {action}
    </button>
  </p>
);

export default FormAlert;
