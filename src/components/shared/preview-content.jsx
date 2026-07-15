import React, { useEffect, useState } from "react";
// ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

const PreviewContent = ({ open, onOpenChange, children, className = "" }) => {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "h-[100dvh] gap-0 overflow-hidden rounded-none border-0 p-0",
            className,
          )}
        >
          <SheetTitle className="sr-only hidden"></SheetTitle>
          <SheetDescription className="sr-only hidden"></SheetDescription>
          <div className="hidden-scrollbar">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[92vh] overflow-hidden p-0 sm:max-w-2xl border-none rounded-3xl hidden-scrollbar",
          className,
        )}
      >
        <DialogTitle className="sr-only hidden"></DialogTitle>
        <DialogDescription className="sr-only hidden"></DialogDescription>
        <div className="hidden-scrollbar overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewContent;
