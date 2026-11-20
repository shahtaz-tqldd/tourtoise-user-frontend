import { cn } from "@/lib/utils";

const Container = ({ children, className = "", childClassName = "" }) => {
  return (
    <main className={cn("flex-1 px-2.5 py-5 md:px-4", className)}>
      <div
        className={cn(
          "mx-auto flex h-full w-full max-w-page flex-col gap-6",
          childClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
};

const Header = ({ children, className }) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full shrink-0 border-b border-line-subtle bg-surface/85 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-page items-center gap-3 px-4 md:h-[72px]">
        {children}
      </div>
    </header>
  );
};

export { Container, Header };
