export const interestOptions = [
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

export const dietaryOptions = [
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

export const mobilityOptions = [
  "No mobility constraints",
  "Avoid long walking",
  "Avoid stairs",
  "Wheelchair-friendly places preferred",
  "Senior-friendly plan",
  "Kid-friendly pacing",
  "Avoid intense physical activities",
  "Other",
];

export const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const languageOptions = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bangla" },
];

export const currencies = [
  { value: "USD", label: "USD" },
  { value: "BDT", label: "BDT" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "INR", label: "INR" },
  { value: "THB", label: "THB" },
  { value: "AED", label: "AED" },
];

export const travelPaceOptions = [
  { value: "moderate", label: "Moderate" },
  { value: "fast", label: "Fast" },
  { value: "slow", label: "Slow" },
];

export const formatList = (value) => {
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

export const getOverviewFormState = (profile = {}) => ({
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

export const flattenOverviewFormState = (formState) => ({
  date_of_birth: formState.personal.date_of_birth,
  gender: formState.personal.gender,
  travel_interests: formState.travel.travel_interests,
  dietary_preferences: formState.travel.dietary_preferences,
  mobility_constraints: formState.travel.mobility_constraints,
  preferred_language: formState.defaults.preferred_language,
  preferred_currency: formState.defaults.preferred_currency,
  travel_pace: formState.defaults.travel_pace,
  emergency_contact_name: formState.emergency.emergency_contact_name.trim(),
  emergency_contact_phone: formState.emergency.emergency_contact_phone.trim(),
});

export const getProfileCardFormState = (profile = {}) => ({
  bio: profile.bio || "",
  city: profile.city || "",
  country: profile.country || "",
  name: profile.name || "",
});

const flattenProfileCardFormState = (formState) => ({
  bio: formState.bio.trim(),
  city: formState.city.trim(),
  name: formState.name.trim(),
  country_of_residence: formState.country,
});

const areValuesEqual = (current, initial) => {
  if (Array.isArray(current) && Array.isArray(initial)) {
    if (current.length !== initial.length) return false;

    const currentValues = [...current].sort();
    const initialValues = [...initial].sort();
    return currentValues.every((value, index) => value === initialValues[index]);
  }

  return current === initial;
};

export const getChangedProfileFields = ({
  profile,
  profileCardFormState,
  overviewFormState,
}) => {
  const currentValues = {
    ...flattenProfileCardFormState(profileCardFormState),
    ...flattenOverviewFormState(overviewFormState),
  };
  const initialValues = {
    ...flattenProfileCardFormState(getProfileCardFormState(profile)),
    ...flattenOverviewFormState(getOverviewFormState(profile)),
  };

  return Object.fromEntries(
    Object.entries(currentValues).filter(
      ([field, value]) => !areValuesEqual(value, initialValues[field]),
    ),
  );
};
