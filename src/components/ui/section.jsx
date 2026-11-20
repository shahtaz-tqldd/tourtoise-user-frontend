import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow, Heading, Text } from "./typography";

/**
 * Header for a block of content: optional eyebrow, title, description and an
 * action slot (e.g. "See all" link) aligned to the right.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  icon,
  level = 2,
  id,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 gap-3">
        {icon && (
          <span className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary md:flex">
            {React.createElement(icon, { size: 20, "aria-hidden": true })}
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
          <Heading level={level} id={id}>
            {title}
          </Heading>
          {description && (
            <Text tone="subtle" className="mt-1.5 max-w-prose">
              {description}
            </Text>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * A page section with consistent vertical rhythm. Pass `surface` to put the
 * content on a white card.
 */
export function Section({
  eyebrow,
  title,
  description,
  action,
  icon,
  level = 2,
  surface = false,
  className,
  bodyClassName,
  children,
  ...props
}) {
  const headingId = useId();
  const hasHeader = Boolean(title);

  return (
    <section
      aria-labelledby={hasHeader ? headingId : undefined}
      className={cn(
        "flex flex-col gap-5",
        surface && "rounded-card bg-surface p-4 shadow-card md:p-6",
        className,
      )}
      {...props}
    >
      {hasHeader && (
        <SectionHeader
          id={headingId}
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={action}
          icon={icon}
          level={level}
        />
      )}
      <div className={cn("min-w-0", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Top-of-page title block. Renders an h1 unless `level` says otherwise. */
export function PageHeader({
  id,
  eyebrow,
  title,
  description,
  actions,
  level = 1,
  className,
}) {
  return (
    <header
      id={id}
      className={cn(
        "flex w-full flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <Heading level={level}>{title}</Heading>
        {description && (
          <Text tone="subtle" className="mt-1.5 max-w-xl">
            {description}
          </Text>
        )}
      </div>
      {actions && <div className="min-w-0 md:flex-1">{actions}</div>}
    </header>
  );
}
