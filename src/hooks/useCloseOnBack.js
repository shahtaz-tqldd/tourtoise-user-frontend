import { useEffect, useRef } from "react";

const OVERLAY_HISTORY_KEY = "__tourtoiseOverlay";

export const useCloseOnBack = (open, onClose) => {
  const activeRef = useRef(false);
  const openRef = useRef(open);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handlePopState = () => {
      if (!activeRef.current || !openRef.current) return;

      activeRef.current = false;
      onCloseRef.current?.();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if (open && !activeRef.current) {
      activeRef.current = true;
      window.history.pushState(
        {
          ...(window.history.state || {}),
          [OVERLAY_HISTORY_KEY]: true,
        },
        "",
        window.location.href,
      );
    }

    if (!open && activeRef.current) {
      activeRef.current = false;
      window.history.back();
    }

    return undefined;
  }, [open]);
};
