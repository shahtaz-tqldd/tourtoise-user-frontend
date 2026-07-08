import React, { useEffect, useRef, useState } from "react";
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
  const touchStartY = useRef(null);

  const handleTouchStart = (event) => {
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event) => {
    if (touchStartY.current === null) return;

    const distance = event.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;

    if (distance > 80) onOpenChange(false);
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "h-[100dvh] gap-0 overflow-hidden rounded-none border-0 p-0",
            className,
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-300 absolute top-0 left-1/2 -translate-x-1/2" />
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
