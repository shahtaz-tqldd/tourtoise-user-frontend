import React from "react";
import {
  CalendarDays,
  Check,
  Circle,
  Clock3,
  FileText,
  Flag,
  Luggage,
  MapPin,
  Users,
} from "lucide-react";

import PreviewContent from "@/components/shared/preview-content";
import { cn, titleCase } from "@/lib/utils";

const formatDate = (value) => {
  if (!value) return "Date not available";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "Anytime";

  const [hour, minute] = String(value).split(":");
  if (hour === undefined || minute === undefined) return value;

  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const DetailMetric = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {React.createElement(Icon, {
        className: "size-4 text-primary",
        "aria-hidden": "true",
      })}
      {label}
    </span>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

const ItemStatusIcon = ({ complete }) => (
  <span
    className={cn(
      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
      complete
        ? "bg-primary text-white"
        : "bg-slate-100 text-slate-400",
    )}
  >
    {complete ? (
      <Check className="size-4" aria-hidden="true" />
    ) : (
      <Circle className="size-3.5" aria-hidden="true" />
    )}
  </span>
);

const PackingReminderContent = ({ metadata }) => {
  const packingItems = metadata.packing_items || [];
  const documents = metadata.required_documents || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <DetailMetric
          icon={Luggage}
          label="Packing items"
          value={`${packingItems.length} item${packingItems.length === 1 ? "" : "s"}`}
        />
        <DetailMetric
          icon={FileText}
          label="Documents"
          value={`${documents.length} document${documents.length === 1 ? "" : "s"}`}
        />
      </div>

      {packingItems.length ? (
        <section>
          <h3 className="mb-3 text-sm font-bold text-slate-950">
            Packing checklist
          </h3>
          <div className="space-y-2">
            {packingItems.map((item, index) => (
              <article
                key={`${item.item}-${index}`}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3"
              >
                <ItemStatusIcon complete={item.is_packed} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.item}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold capitalize text-primary">
                      {titleCase(item.priority) || "Item"}
                    </span>
                    {item.quantity ? (
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                        Quantity: {item.quantity}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {documents.length ? (
        <section>
          <h3 className="mb-3 text-sm font-bold text-slate-950">
            Required documents
          </h3>
          <div className="space-y-2">
            {documents.map((document, index) => (
              <article
                key={`${document.name}-${index}`}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3"
              >
                <ItemStatusIcon complete={document.is_packed} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {document.name}
                    </p>
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold capitalize text-amber-700">
                      {titleCase(document.required_level) || "Required"}
                    </span>
                  </div>
                  {document.notes ? (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {document.notes}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

const TripStartedContent = ({ metadata }) => {
  const destinations = metadata.destinations || [];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-primary p-5 text-white">
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
          {titleCase(metadata.status) || "Trip started"}
        </span>
        <h3 className="mt-3 text-lg font-bold">
          {metadata.title || "Your trip"}
        </h3>
        <p className="mt-1 text-sm text-white/80">
          Your itinerary is underway. Keep your daily plan and essentials close.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailMetric
          icon={CalendarDays}
          label="Starts"
          value={formatDate(metadata.start_date)}
        />
        <DetailMetric
          icon={Flag}
          label="Ends"
          value={formatDate(metadata.end_date)}
        />
        <DetailMetric
          icon={Clock3}
          label="Duration"
          value={`${metadata.duration_days || 0} day${metadata.duration_days === 1 ? "" : "s"}`}
        />
        <DetailMetric
          icon={Users}
          label="Travelers"
          value={`${metadata.travelers_count || 0} traveler${metadata.travelers_count === 1 ? "" : "s"}`}
        />
      </div>

      {destinations.length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-950">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            Destinations
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {destinations.map((destination) => (
              <span
                key={destination}
                className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
              >
                {destination}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

const DailySummaryContent = ({ metadata }) => {
  const items = metadata.items || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {metadata.trip_day ? (
          <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white">
            Day {metadata.trip_day}
          </span>
        ) : null}
        {metadata.destination ? (
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" />
            {metadata.destination}
          </span>
        ) : null}
        {metadata.date ? (
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            <CalendarDays className="size-3.5 text-primary" aria-hidden="true" />
            {formatDate(metadata.date)}
          </span>
        ) : null}
      </div>

      {metadata.summary ? (
        <p className="rounded-2xl bg-primary/5 p-4 text-sm leading-6 text-slate-600">
          {metadata.summary}
        </p>
      ) : null}

      {items.length ? (
        <section>
          <h3 className="mb-3 text-sm font-bold text-slate-950">
            Today&apos;s plan
          </h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <article
                key={`${item.time}-${item.title}-${index}`}
                className="flex gap-3"
              >
                <div className="flex w-16 shrink-0 flex-col items-center">
                  <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                    {formatTime(item.time)}
                  </span>
                  {index < items.length - 1 ? (
                    <span className="mt-2 min-h-5 w-px flex-1 bg-slate-200" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-bold text-slate-950">
                    {item.title}
                  </h4>
                  {item.description ? (
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  ) : null}
                  {item.notes ? (
                    <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                      {item.notes}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

const eventContent = {
  packing_reminder: PackingReminderContent,
  trip_started: TripStartedContent,
  daily_summary: DailySummaryContent,
};

const TripNotificationDetails = ({ notification, onOpenChange }) => {
  const metadata = notification?.metadata || {};
  const Content = eventContent[metadata.event_type];

  return (
    <PreviewContent
      open={Boolean(notification && Content)}
      onOpenChange={onOpenChange}
      title={notification?.title || "Trip notification details"}
      description={notification?.message}
      desktopClassName="sm:max-w-3xl"
    >
      {notification && Content ? (
        <div className="min-h-full bg-slate-50">
          <header className="border-b border-slate-200 bg-white px-5 py-5 pr-12 md:px-6 md:py-6 md:pr-14">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {titleCase(metadata.event_type)}
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">
              {notification.title}
            </h2>
            {notification.message ? (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {notification.message}
              </p>
            ) : null}
          </header>
          <div className="p-4 md:p-6">
            <Content metadata={metadata} />
          </div>
        </div>
      ) : null}
    </PreviewContent>
  );
};

export default TripNotificationDetails;
