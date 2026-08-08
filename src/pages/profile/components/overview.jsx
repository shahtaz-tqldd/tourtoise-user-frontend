import { PreviewCard } from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Cake,
  Languages,
  Phone,
  Rabbit,
  ShieldCheck,
  TentTree,
  Utensils,
  WalletCards,
} from "lucide-react";
import React from "react";
import {
  currencies,
  dietaryOptions,
  formatList,
  genderOptions,
  interestOptions,
  languageOptions,
  mobilityOptions,
  travelPaceOptions,
} from "../profile-form-state";

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

const getOptionLabel = (value, options, fallback = EMPTY_VALUE) => {
  const match = options.find(
    (option) =>
      option.value.toLowerCase() === String(value || "").toLowerCase(),
  );

  return match?.label || fallback;
};

const titleize = (value) => {
  if (!value) return EMPTY_VALUE;
  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const Overview = ({ isEditing, profile = {}, formState, onFormStateChange }) => {
  const travelInterests = formatList(profile.travel_interests);
  const dietaryPreferences = formatList(profile.dietary_preferences);
  const mobilityConstraints = formatList(profile.mobility_constraints);

  const personalDetails = [
    {
      label: "Date of birth",
      value: formatDate(profile.date_of_birth),
      icon: Cake,
    },
    {
      label: "Gender",
      value: getOptionLabel(profile.gender, genderOptions),
      icon: BadgeCheck,
    },
  ];

  const preferenceDetails = [
    {
      label: "Preferred language",
      value: getOptionLabel(
        profile.preferred_language,
        languageOptions,
        "English",
      ),
      icon: Languages,
    },
    {
      label: "Preferred currency",
      value: profile.preferred_currency || "USD",
      icon: WalletCards,
    },
    {
      label: "Travel pace",
      value: getOptionLabel(profile.travel_pace, travelPaceOptions),
      icon: Rabbit,
    },
  ];

  const hasEmergencyContact =
    profile.emergency_contact_name || profile.emergency_contact_phone;

  const updateField = (section, field, value) => {
    onFormStateChange((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const toggleListField = (field, value) => {
    onFormStateChange((current) => {
      const values = current.travel[field] || [];
      const nextValues = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];

      return {
        ...current,
        travel: {
          ...current.travel,
          [field]: nextValues,
        },
      };
    });
  };

  return (
    <PreviewCard className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] md:p-8 md:rounded-t-none">
      <div className="space-y-10 md:space-y-12">
        <ProfileInfoCard
          title="Personal Details"
          description="Basic information connected to this travel profile."
          items={personalDetails}
          isEditing={isEditing}
        />
        {isEditing ? (
          <div className="-mt-4 grid gap-4 sm:grid-cols-2">
            <FloatingInput
              name="date_of_birth"
              label="Date of birth"
              type="date"
              value={formState.personal.date_of_birth}
              onChange={(event) =>
                updateField("personal", "date_of_birth", event.target.value)
              }
            />
            <FloatingSelect
              label="Gender"
              value={formState.personal.gender}
              onValueChange={(value) =>
                updateField("personal", "gender", value)
              }
            >
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </FloatingSelect>
          </div>
        ) : null}

        <div>
          <SectionTitle
            section="travel"
            title="Travel Profile"
            description="Preferences Tourtoise can use while shaping trips."
          />
          {isEditing ? (
            <div className="mt-5 grid gap-4">
              <OptionButtonGroup
                title="Travel interests"
                options={interestOptions}
                values={formState.travel.travel_interests}
                onToggle={(value) => toggleListField("travel_interests", value)}
              />
              <OptionButtonGroup
                title="Dietary preferences"
                options={dietaryOptions}
                values={formState.travel.dietary_preferences}
                onToggle={(value) =>
                  toggleListField("dietary_preferences", value)
                }
              />
              <OptionButtonGroup
                title="Mobility constraints"
                options={mobilityOptions}
                values={formState.travel.mobility_constraints}
                onToggle={(value) =>
                  toggleListField("mobility_constraints", value)
                }
              />
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <ChipGroup
                icon={TentTree}
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
          )}
        </div>
      </div>

      <div className="space-y-8 md:space-y-10">
        <ProfileInfoCard
          title="Travel Defaults"
          description="Locale and trip-planning defaults."
          items={preferenceDetails}
          isEditing={isEditing}
        />
        {isEditing ? (
          <div className="grid gap-4">
            <FloatingSelect
              label="Preferred language"
              value={formState.defaults.preferred_language}
              onValueChange={(value) =>
                updateField("defaults", "preferred_language", value)
              }
            >
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </FloatingSelect>
            <FloatingSelect
              label="Preferred currency"
              value={formState.defaults.preferred_currency}
              onValueChange={(value) =>
                updateField("defaults", "preferred_currency", value)
              }
            >
              {currencies.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </FloatingSelect>
            <FloatingSelect
              label="Travel pace"
              value={formState.defaults.travel_pace}
              onValueChange={(value) =>
                updateField("defaults", "travel_pace", value)
              }
            >
              {travelPaceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </FloatingSelect>
          </div>
        ) : null}

        <div>
          <SectionTitle
            section="emergency"
            title="Emergency Contact"
            description="Contact information saved for travel support."
          />
          {isEditing ? (
            <div className="mt-5 grid gap-4">
              <FloatingInput
                name="emergency_contact_name"
                label="Emergency contact name"
                value={formState.emergency.emergency_contact_name}
                onChange={(event) =>
                  updateField(
                    "emergency",
                    "emergency_contact_name",
                    event.target.value,
                  )
                }
              />
              <FloatingInput
                name="emergency_contact_phone"
                label="Emergency contact phone"
                value={formState.emergency.emergency_contact_phone}
                onChange={(event) =>
                  updateField(
                    "emergency",
                    "emergency_contact_phone",
                    event.target.value,
                  )
                }
              />
            </div>
          ) : hasEmergencyContact ? (
            <div className="mt-5 space-y-3">
              <InfoRow
                icon={Phone}
                label={profile.emergency_contact_name || EMPTY_VALUE}
                value={profile.emergency_contact_phone || EMPTY_VALUE}
              />
            </div>
          ) : (
            <EmptyState message="No emergency contact added." />
          )}
        </div>
      </div>
    </PreviewCard>
  );
};

const ProfileInfoCard = ({ title, description, items, isEditing }) => (
  <div>
    <SectionTitle title={title} description={description} />
    {!isEditing && (
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <InfoRow key={item.label} {...item} />
        ))}
      </div>
    )}
  </div>
);

const SectionTitle = ({ title, description }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      )}
    </div>
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

const OptionButtonGroup = ({ title, options, values, onToggle }) => (
  <div>
    <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = values.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "rounded-full border px-3 py-2 text-xs font-semibold transition",
              selected
                ? "border-primary bg-primary text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-primary/50",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

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
        <div className="mt-2 flex flex-wrap gap-2 ml-10">
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
        <EmptyState message={emptyText} className="ml-9" />
      )}
    </div>
  );
};

const EmptyState = ({ message, className }) => (
  <p
    className={cn(
      "mt-2 rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-sm text-slate-500",
      className,
    )}
  >
    {message}
  </p>
);

export default Overview;
