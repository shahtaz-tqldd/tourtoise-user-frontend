import { cn } from "@/lib/utils";

const Container = ({ children, className = "", childClassName = "" }) => {
  return (
    <main
      className={cn(
        "flex-1  px-2.5 py-5 md:px-4 bg-emerald-50/50",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto w-full h-full max-w-7xl flex flex-col gap-6",
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
        "sticky top-0 z-40 w-full shrink-0 border-b border-b-primary/10 bg-white/10 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-2.5 md:py-3">
        {children}
      </div>
    </header>
  );
};

export { Container, Header };
