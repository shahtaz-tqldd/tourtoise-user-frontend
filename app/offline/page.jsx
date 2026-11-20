import Link from "next/link";

export const metadata = { title: "Offline" };

/** Offline fallback shown by the service worker when the network fails. */
export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
      <span className="text-4xl" aria-hidden="true">
        🐢
      </span>
      <h1 className="text-h1 font-display font-bold">You are offline</h1>
      <p className="max-w-md text-body text-subtle">
        tourtoise needs a connection to keep planning. Check your network and
        try again.
      </p>
      <Link href="/" className="mt-2 font-medium text-primary hover:underline">
        Retry
      </Link>
    </div>
  );
}
