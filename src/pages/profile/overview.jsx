import Card, { PreviewCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { useUpdateAccountMutation } from "@/features/auth/authApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Cake,
  Languages,
  Loader2,
  Phone,
  PenLine,
  Rabbit,
  ShieldCheck,
  TentTree,
  Utensils,
  WalletCards,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

const EMPTY_VALUE = "Not set";

const interestOptions = [
  "Food",
  "History",
  "Nature",
  "Nightlife",
  "Adventure",
  "Shopping",
  "Culture",
  "Beaches",
  "Photography",
  "Local experiences",
  "Family-friendly activities",
  "Luxury experiences",
  "Hidden gems",
];

const dietaryOptions = [
  "No restriction",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Gluten-free",
  "Seafood allergy",
  "Nut allergy",
  "Avoid pork",
  "Other",
];

const mobilityOptions = [
  "No mobility constraints",
  "Avoid long walking",
  "Avoid stairs",
  "Wheelchair-friendly places preferred",
  "Senior-friendly plan",
  "Kid-friendly pacing",
  "Avoid intense physical activities",
  "Other",
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bangla" },
];

const currencies = [
  { value: "USD", label: "USD" },
  { value: "BDT", label: "BDT" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "INR", label: "INR" },
  { value: "THB", label: "THB" },
  { value: "AED", label: "AED" },
];

const travelPaceOptions = [
  { value: "moderate", label: "Moderate" },
  { value: "fast", label: "Fast" },
  { value: "slow", label: "Slow" },
];

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

const normalizeOptionList = (values, options) => {
  const optionMap = new Map(
    options.map((option) => [option.toLowerCase(), option]),
  );

  return formatList(values)
    .map((value) => optionMap.get(String(value).toLowerCase()))
    .filter(Boolean);
};

const normalizeSelectValue = (value, options) => {
  if (!value) return "";

  const match = options.find(
    (option) => option.value.toLowerCase() === String(value).toLowerCase(),
  );

  return match?.value || "";
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

const getOverviewFormState = (profile = {}) => ({
  personal: {
    date_of_birth: profile.date_of_birth || "",
    gender: normalizeSelectValue(profile.gender, genderOptions),
  },
  travel: {
    travel_interests: normalizeOptionList(
      profile.travel_interests,
      interestOptions,
    ),
    dietary_preferences: normalizeOptionList(
      profile.dietary_preferences,
      dietaryOptions,
    ),
    mobility_constraints: normalizeOptionList(
      profile.mobility_constraints,
      mobilityOptions,
    ),
  },
  defaults: {
    preferred_language: normalizeSelectValue(
      profile.preferred_language,
      languageOptions,
    ),
    preferred_currency: normalizeSelectValue(
      profile.preferred_currency,
      currencies,
    ),
    travel_pace: normalizeSelectValue(profile.travel_pace, travelPaceOptions),
  },
  emergency: {
    emergency_contact_name: profile.emergency_contact_name || "",
    emergency_contact_phone: profile.emergency_contact_phone || "",
  },
});

const Overview = ({ profile = {}, canEdit = false, onUpdated }) => {
  const [editingSection, setEditingSection] = useState(null);
  const [formState, setFormState] = useState(() =>
    getOverviewFormState(profile),
  );
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();

  const latestFormState = useMemo(
    () => getOverviewFormState(profile),
    [profile],
  );

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

  const startEditing = (section) => {
    setFormState(latestFormState);
    setEditingSection(section);
  };

  const cancelEditing = () => {
    setFormState(latestFormState);
    setEditingSection(null);
  };

  const updateField = (section, field, value) => {
    setFormState((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const toggleListField = (field, value) => {
    setFormState((current) => {
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

  const saveSection = async (section) => {
    const sectionState = formState[section];
    const payloadBySection = {
      personal: {
        date_of_birth: sectionState?.date_of_birth || null,
        gender: sectionState?.gender?.trim() || "",
      },
      travel: {
        travel_interests: sectionState?.travel_interests || [],
        dietary_preferences: sectionState?.dietary_preferences || [],
        mobility_constraints: sectionState?.mobility_constraints || [],
      },
      defaults: {
        preferred_language: sectionState?.preferred_language?.trim() || "",
        preferred_currency: sectionState?.preferred_currency?.trim() || "",
        travel_pace: sectionState?.travel_pace?.trim() || "",
      },
      emergency: {
        emergency_contact_name:
          sectionState?.emergency_contact_name?.trim() || "",
        emergency_contact_phone:
          sectionState?.emergency_contact_phone?.trim() || "",
      },
    };

    try {
      await updateAccount(payloadBySection[section]).unwrap();
      await onUpdated?.();
      setEditingSection(null);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update profile."));
    }
  };

  return (
    <PreviewCard className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] md:p-8 md:rounded-t-none">
      <div className="space-y-10 md:space-y-12">
        <ProfileInfoCard
          section="personal"
          title="Personal Details"
          description="Basic information connected to this travel profile."
          items={personalDetails}
          canEdit={canEdit}
          isEditing={editingSection === "personal"}
          isUpdating={isUpdating}
          onEdit={() => startEditing("personal")}
          onCancel={cancelEditing}
          onSave={() => saveSection("personal")}
        />
        {editingSection === "personal" && (
          <div className="grid gap-4 sm:grid-cols-2">
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
        )}

        <div>
          <SectionTitle
            section="travel"
            title="Travel Profile"
            description="Preferences Tourtoise can use while shaping trips."
            canEdit={canEdit}
            isEditing={editingSection === "travel"}
            isUpdating={isUpdating}
            onEdit={() => startEditing("travel")}
            onCancel={cancelEditing}
            onSave={() => saveSection("travel")}
          />
          {editingSection === "travel" ? (
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

      <div className="space-y-5">
        <ProfileInfoCard
          section="defaults"
          title="Travel Defaults"
          description="Locale and trip-planning defaults."
          items={preferenceDetails}
          canEdit={canEdit}
          isEditing={editingSection === "defaults"}
          isUpdating={isUpdating}
          onEdit={() => startEditing("defaults")}
          onCancel={cancelEditing}
          onSave={() => saveSection("defaults")}
        />
        {editingSection === "defaults" && (
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
        )}

        <Card>
          <SectionTitle
            section="emergency"
            title="Emergency Contact"
            description="Contact information saved for travel support."
            canEdit={canEdit}
            isEditing={editingSection === "emergency"}
            isUpdating={isUpdating}
            onEdit={() => startEditing("emergency")}
            onCancel={cancelEditing}
            onSave={() => saveSection("emergency")}
          />
          {editingSection === "emergency" ? (
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
        </Card>
      </div>
    </PreviewCard>
  );
};

const ProfileInfoCard = ({
  title,
  description,
  items,
  canEdit,
  isEditing,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
}) => (
  <div>
    <SectionTitle
      title={title}
      description={description}
      canEdit={canEdit}
      isEditing={isEditing}
      isUpdating={isUpdating}
      onEdit={onEdit}
      onCancel={onCancel}
      onSave={onSave}
    />
    {!isEditing && (
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <InfoRow key={item.label} {...item} />
        ))}
      </div>
    )}
  </div>
);

const SectionTitle = ({
  title,
  description,
  canEdit,
  isEditing,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      )}
    </div>
    {canEdit &&
      (isEditing ? (
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isUpdating}
            onClick={onCancel}
            className="h-8 rounded-lg px-3 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isUpdating}
            onClick={onSave}
            className="h-8 rounded-lg px-3 text-xs"
          >
            {isUpdating && <Loader2 className="animate-spin" />}
            Save changes
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onEdit}
          className="rounded-full text-slate-500 hover:text-primary"
          aria-label={`Edit ${title}`}
        >
          <PenLine className="!size-3.5" />
        </Button>
      ))}
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
