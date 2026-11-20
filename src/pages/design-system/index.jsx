import React from "react";
import { Bookmark, Clock, Sparkles } from "lucide-react";

import Badge from "@/components/ui/badge";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader, Section } from "@/components/ui/section";
import { Display, Eyebrow, Heading, Text } from "@/components/ui/typography";
import { palette } from "@/design-system/tokens";
import useTitle from "@/hooks/useTitle";

const SCALES = [
  { name: "brand", note: "Primary actions, links, active states" },
  { name: "sand", note: "Warm highlights, best-time, warnings" },
  { name: "ocean", note: "Info, maps, water" },
  { name: "ink", note: "Text, borders, neutral surfaces" },
];

const TEXT_ROLES = [
  { cls: "text-heading", label: "heading", use: "Titles, key values" },
  { cls: "text-body", label: "body", use: "Running copy" },
  { cls: "text-subtle", label: "subtle", use: "Descriptions, meta" },
  { cls: "text-faint", label: "faint", use: "Placeholders, hints" },
  { cls: "text-brand-text", label: "brand-text", use: "Eyebrows, emphasis" },
];

const SURFACES = [
  { cls: "bg-canvas", label: "canvas" },
  { cls: "bg-surface", label: "surface" },
  { cls: "bg-surface-subtle", label: "surface-subtle" },
  { cls: "bg-surface-muted", label: "surface-muted" },
  { cls: "bg-surface-inverse", label: "surface-inverse" },
];

// Written out in full so Tailwind can see the class names.
const FEEDBACK = [
  { name: "success", box: "bg-success-soft", text: "text-success" },
  { name: "warning", box: "bg-warning-soft", text: "text-warning" },
  { name: "danger", box: "bg-danger-soft", text: "text-danger" },
  { name: "info", box: "bg-info-soft", text: "text-info" },
];

const TYPE_SCALE = [
  { cls: "font-display text-display-xl", token: "display-xl", size: "56px" },
  { cls: "font-display text-display-lg", token: "display-lg", size: "44px" },
  { cls: "font-display text-display", token: "display", size: "36px" },
  { cls: "font-display text-h1", token: "h1", size: "30px" },
  { cls: "font-display text-h2", token: "h2", size: "24px" },
  { cls: "font-display text-h3", token: "h3", size: "20px" },
  { cls: "font-display text-h4", token: "h4", size: "17px" },
  { cls: "text-body-lg", token: "body-lg", size: "17px" },
  { cls: "text-body-md", token: "body-md", size: "16px" },
  { cls: "text-body-sm", token: "body-sm", size: "14px" },
  { cls: "text-caption", token: "caption", size: "12px" },
  { cls: "text-overline uppercase", token: "overline", size: "11px" },
];

const Swatch = ({ className, label, sub }) => (
  <div className="min-w-0">
    <div className={`h-14 rounded-xl ring-1 ring-black/5 ${className}`} />
    <p className="mt-2 truncate text-caption font-semibold text-heading">{label}</p>
    {sub && <p className="truncate text-2xs text-subtle">{sub}</p>}
  </div>
);

const DesignSystemPage = () => {
  useTitle("tourtoise - design system");

  return (
    <Container childClassName="gap-section">
      <PageHeader
        eyebrow="Design system"
        title="tourtoise foundations"
        description="Tokens and primitives every screen is built from. Source of truth: src/styles/tokens.css."
      />

      <Section
        surface
        title="Color palette"
        description="Raw scales. Reach for semantic roles below first."
      >
        <div className="space-y-6">
          {SCALES.map(({ name, note }) => (
            <div key={name}>
              <p className="text-body-sm font-semibold text-heading">
                {name} <span className="font-normal text-subtle">— {note}</span>
              </p>
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
                {Object.entries(palette[name]).map(([step, hex]) => (
                  <div key={step} className="min-w-0">
                    <div
                      className="h-12 rounded-lg ring-1 ring-black/5"
                      style={{ backgroundColor: hex }}
                    />
                    <p className="mt-1.5 text-2xs font-semibold text-heading">{step}</p>
                    <p className="text-3xs uppercase text-subtle">{hex}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section surface title="Text roles" level={3}>
          <ul className="divide-y divide-line-subtle">
            {TEXT_ROLES.map(({ cls, label, use }) => (
              <li key={label} className="flex items-baseline justify-between gap-4 py-3">
                <span className={`font-display text-h4 ${cls}`}>The quick tortoise</span>
                <span className="shrink-0 text-right">
                  <code className="text-caption text-heading">{cls}</code>
                  <span className="block text-2xs text-subtle">{use}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section surface title="Surfaces & feedback" level={3}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {SURFACES.map(({ cls, label }) => (
              <Swatch key={label} className={cls} label={label} />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FEEDBACK.map(({ name, box, text }) => (
              <div key={name} className={`rounded-xl p-3 ${box}`}>
                <p className={`text-body-sm font-semibold ${text}`}>{name}</p>
                <p className="text-2xs text-subtle">
                  text-{name} / bg-{name}-soft
                </p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        surface
        title="Typography"
        description="Plus Jakarta Sans for display & headings, Inter for everything else. Each step bundles size, line-height, tracking and weight."
      >
        <ul className="divide-y divide-line-subtle">
          {TYPE_SCALE.map(({ cls, token, size }) => (
            <li
              key={token}
              className="grid grid-cols-[88px_minmax(0,1fr)] items-baseline gap-4 py-3 sm:grid-cols-[120px_minmax(0,1fr)]"
            >
              <span>
                <code className="text-caption font-semibold text-heading">{token}</code>
                <span className="block text-2xs text-subtle">{size}</span>
              </span>
              <span className={`truncate text-heading ${cls}`}>
                Slow travel, smart plans
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl bg-surface-subtle p-5">
          <Eyebrow>Components</Eyebrow>
          <Display size="md" className="mt-2">
            &lt;Display&gt; for heroes
          </Display>
          <Heading level={2} className="mt-3">
            &lt;Heading level=&#123;2&#125;&gt; for sections
          </Heading>
          <Text className="mt-2">
            &lt;Text&gt; for copy, with tones: body, subtle, faint, brand, inverse.
          </Text>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section surface title="Buttons" level={3}>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Sparkles /> Primary
            </Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-brand-deep p-4">
            <Button variant="inverse">Inverse</Button>
            <Button variant="inverse-outline">Inverse outline</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm">sm</Button>
            <Button>default</Button>
            <Button size="lg">lg</Button>
            <Button size="xl">xl</Button>
            <Button size="icon" aria-label="Save">
              <Bookmark />
            </Button>
          </div>
        </Section>

        <Section surface title="Badges & cards" level={3}>
          <div className="flex flex-wrap gap-2">
            <Badge>primary-accent</Badge>
            <Badge variant="primary">primary</Badge>
            <Badge variant="neutral">neutral</Badge>
            <Badge variant="accent" icon={Clock}>
              best time
            </Badge>
            <Badge variant="info">info</Badge>
            <Badge variant="success">success</Badge>
            <Badge variant="danger">danger</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Card className="border border-line shadow-card">
              <Heading level={4}>Card</Heading>
              <Text size="sm" tone="subtle" className="mt-1">
                rounded-card · bg-surface · shadow-card
              </Text>
            </Card>
            <Card className="bg-brand-mist">
              <Heading level={4}>bg-brand-mist</Heading>
              <Text size="sm" tone="subtle" className="mt-1">
                Soft branded panels and CTAs
              </Text>
            </Card>
          </div>
        </Section>
      </div>

      <Section
        surface
        title="Radius, elevation & layout"
        description="rounded-control (buttons, inputs) · rounded-card (cards) · rounded-sheet (dialogs, heroes). Page width max-w-page (1280px)."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {["shadow-card", "shadow-raised", "shadow-overlay", "shadow-brand"].map(
            (cls) => (
              <div
                key={cls}
                className={`rounded-card bg-surface p-5 text-center text-caption font-semibold text-heading ${cls}`}
              >
                {cls}
              </div>
            ),
          )}
        </div>
      </Section>
    </Container>
  );
};

export default DesignSystemPage;
