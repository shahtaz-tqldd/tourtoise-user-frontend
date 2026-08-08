import React from "react";

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
import { useMediaQuery } from "@/lib/mobile-visible";

const PreviewContent = ({ open, onOpenChange, children, className = "" }) => {
  const isMobile = useMediaQuery();

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
