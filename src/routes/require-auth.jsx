import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { AUTH_REASONS, useAuthGate } from "@/features/auth/auth-gate-context";
import useAuth from "@/hooks/useAuth";

/**
 * Guards member-only routes. Guests stay on the page (inside the public shell)
 * and see a sign-in prompt; the auth modal opens once automatically. After a
 * successful sign-in the protected content renders in place.
 */
const RequireAuth = ({ children, reason = "default" }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { authChecked, isLoading } = useAuth();

  if (!isAuthenticated) return <SignInRequired reason={reason} />;
  if (!authChecked || isLoading) return null;

  return children;
};

const SignInRequired = ({ reason }) => {
  const { openAuth } = useAuthGate();
  const openedRef = useRef(false);
  const copy = AUTH_REASONS[reason] || AUTH_REASONS.default;

  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    openAuth("login", reason);
  }, [openAuth, reason]);

  return (
    <Container childClassName="justify-center">
      <section className="relative isolate mx-auto w-full max-w-xl overflow-hidden rounded-sheet bg-surface px-6 py-14 text-center shadow-card sm:px-10">
        <div
          className="absolute -left-16 -top-10 -z-10 size-56 rounded-full bg-brand-100/60 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 -right-10 -z-10 size-56 rounded-full bg-sand-100/70 blur-3xl"
          aria-hidden="true"
        />

        <span className="mx-auto center size-16 -rotate-6 rounded-2xl bg-primary text-white shadow-brand">
          <LockKeyhole className="size-7" aria-hidden="true" />
        </span>
        <Eyebrow className="mt-6">Members only</Eyebrow>
        <Heading level={1} className="mt-2">
          {copy.title}
        </Heading>
        <Text tone="subtle" className="mx-auto mt-3 max-w-md">
          {copy.description}
        </Text>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={() => openAuth("login", reason)}>
            Sign in
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => openAuth("register", reason)}
          >
            Create free account
          </Button>
        </div>
      </section>
    </Container>
  );
};

export default RequireAuth;
