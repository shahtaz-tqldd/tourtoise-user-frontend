import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/mobile-visible";
import { cn } from "@/lib/utils";

/**
 * Responsive container for rich dropdown content.
 *
 * It is anchored to the trigger on desktop and presented as a bottom drawer on
 * mobile. The consumer owns the content and the open state, so the same shell
 * can be reused for filters, previews, and other compact forms.
 */
const PreviewDropdown = ({
  open,
  onOpenChange,
  trigger,
  children,
  title = "Menu",
  description,
  align = "end",
  sideOffset = 8,
  className,
  desktopClassName,
  mobileClassName,
}) => {
  const isMobile = useMediaQuery();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="bottom"
          className={cn(
            "max-h-[85dvh] gap-0 overflow-hidden rounded-t-3xl border-x-0 border-b-0 bg-white p-0",
            className,
            mobileClassName,
          )}
        >
          <SheetTitle className="sr-only">{title}</SheetTitle>
          <SheetDescription className="sr-only">
            {description || title}
          </SheetDescription>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "flex w-[min(calc(100vw-2rem),420px)] flex-col overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-xl",
          className,
          desktopClassName,
        )}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PreviewDropdown;
