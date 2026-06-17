import Card from "@/components/ui/card";
import {
  BadgeCheck,
  Cake,
  CircleUserRound,
  Globe2,
  HeartPulse,
  Languages,
  MapPin,
  Phone,
  Rabbit,
  ShieldCheck,
  Utensils,
  WalletCards,
} from "lucide-react";
import React from "react";

const EMPTY_VALUE = "Not set";

const formatDate = (value) => {
  if (!value) return EMPTY_VALUE;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

const titleize = (value) => {
  if (!value) return EMPTY_VALUE;
  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const Overview = ({ profile = {} }) => {
  const travelInterests = formatList(profile.travel_interests);
  const dietaryPreferences = formatList(profile.dietary_preferences);
  const mobilityConstraints = formatList(profile.mobility_constraints);

  const personalDetails = [
    {
      label: "Username",
      value: profile.username ? `@${profile.username}` : EMPTY_VALUE,
      icon: CircleUserRound,
    },
    {
      label: "Date of birth",
      value: formatDate(profile.date_of_birth),
      icon: Cake,
    },
    {
      label: "Gender",
      value: titleize(profile.gender),
      icon: BadgeCheck,
    },
    {
      label: "Location",
      value:
        [profile.city, profile.country_of_residence]
          .filter(Boolean)
          .join(", ") || EMPTY_VALUE,
      icon: MapPin,
    },
  ];

  const preferenceDetails = [
    {
      label: "Preferred language",
      value: profile.preferred_language?.toUpperCase() || "EN",
      icon: Languages,
    },
    {
      label: "Preferred currency",
      value: profile.preferred_currency || "USD",
      icon: WalletCards,
    },
    {
      label: "Travel pace",
      value: titleize(profile.travel_pace),
      icon: Rabbit,
    },
    {
      label: "Profile visibility",
      value: profile.is_public_profile ? "Public profile" : "Private profile",
      icon: Globe2,
    },
  ];

  const hasEmergencyContact =
    profile.emergency_contact_name || profile.emergency_contact_phone;

  return (
    <Card className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-8">
        <ProfileInfoCard
          title="Personal Details"
          description="Basic information connected to this travel profile."
          items={personalDetails}
        />

        <div>
          <SectionTitle
            title="Travel Profile"
            description="Preferences Tourtoise can use while shaping trips."
          />
          <div className="mt-5 space-y-4">
            <ChipGroup
              icon={HeartPulse}
              title="Travel interests"
              values={travelInterests}
              emptyText="No interests added"
            />
            <ChipGroup
              icon={Utensils}
              title="Dietary preferences"
              values={dietaryPreferences}
              emptyText="No dietary preferences added"
            />
            <ChipGroup
              icon={ShieldCheck}
              title="Mobility constraints"
              values={mobilityConstraints}
              emptyText="No mobility constraints added"
              className="sm:col-span-2"
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <ProfileInfoCard
          title="Travel Defaults"
          description="Locale and trip-planning defaults."
          items={preferenceDetails}
        />

        <Card>
          <SectionTitle
            title="Emergency Contact"
            description="Contact information saved for travel support."
          />
          {hasEmergencyContact ? (
            <div className="mt-5 space-y-3">
              <InfoRow
                icon={CircleUserRound}
                label="Name"
                value={profile.emergency_contact_name || EMPTY_VALUE}
              />
              <InfoRow
                icon={Phone}
                label="Phone"
                value={profile.emergency_contact_phone || EMPTY_VALUE}
              />
            </div>
          ) : (
            <EmptyState message="No emergency contact added." />
          )}
        </Card>
      </div>
    </Card>
  );
};

const ProfileInfoCard = ({ title, description, items }) => (
  <div>
    <SectionTitle title={title} description={description} />
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <InfoRow key={item.label} {...item} />
      ))}
    </div>
  </div>
);

const SectionTitle = ({ title, description }) => (
  <div>
    <h2 className="text-base font-bold text-slate-950">{title}</h2>
    {description && (
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    )}
  </div>
);

const InfoRow = ({ icon, label, value }) => {
  const Icon = icon;

  return (
    <div className="flex min-w-0 gap-3">
      <div className="center size-10 shrink-0 rounded-full bg-white text-primary">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-800">
          {value || EMPTY_VALUE}
        </p>
      </div>
    </div>
  );
};

const ChipGroup = ({ icon, title, values, emptyText, className = "" }) => {
  const Icon = icon;

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-1">
        <div className="center size-10 shrink-0 rounded-full bg-white text-primary">
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>

      {values.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              {titleize(value)}
            </span>
          ))}
        </div>
      ) : (
        <EmptyState message={emptyText} />
      )}
    </div>
  );
};

const EmptyState = ({ message }) => (
  <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
    {message}
  </p>
);

export default Overview;
