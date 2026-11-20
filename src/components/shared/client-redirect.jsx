"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Client-side equivalent of react-router's <Navigate replace />. */
const ClientRedirect = ({ to }) => {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return null;
};

export default ClientRedirect;
