import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Compass, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { FloatingTextarea } from "@/components/ui/textarea";
import { useUpdateAccountMutation } from "@/features/auth/authApiSlice";
import useAuth from "@/hooks/useAuth";
import { COUNTRY_LIST } from "@/lib/countries";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";
import {
  currencies,
  dietaryOptions,
  genderOptions,
  interestOptions,
  languageOptions,
  mobilityOptions,
  travelPaceOptions,
} from "@/pages/profile/profile-form-state";
import { Logo } from "@/components/shared/utils";

const steps = [
  { title: "About you", description: "Personal details and a trusted contact" },
  {
    title: "Your defaults",
    description: "How you like to communicate and travel",
  },
  {
    title: "Travel profile",
    description: "Interests and accessibility preferences",
  },
];

const initialForm = {
  date_of_birth: "",
  gender: "",
  city: "",
  country_of_residence: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  preferred_language: "",
  preferred_currency: "",
  travel_pace: "",
  bio: "",
  travel_interests: [],
  dietary_preferences: [],
  mobility_constraints: [],
};

const stepFields = [
  [
    "date_of_birth",
    "gender",
    "city",
    "country_of_residence",
    "emergency_contact_name",
    "emergency_contact_phone",
  ],
  ["preferred_language", "preferred_currency", "travel_pace", "bio"],
  ["travel_interests", "dietary_preferences", "mobility_constraints"],
];

const getInitialForm = (user = {}) => ({
  ...initialForm,
  date_of_birth: user?.date_of_birth || "",
  gender: user?.gender || "",
  city: user?.city || "",
  country_of_residence: user?.country_of_residence || user?.country || "",
  emergency_contact_name: user?.emergency_contact_name || "",
  emergency_contact_phone: user?.emergency_contact_phone || "",
  preferred_language: user?.preferred_language || "",
  preferred_currency: user?.preferred_currency || "",
  travel_pace: user?.travel_pace || "",
  bio: user?.bio || "",
  travel_interests: user?.travel_interests || [],
  dietary_preferences: user?.dietary_preferences || [],
  mobility_constraints: user?.mobility_constraints || [],
});

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => getInitialForm(user));
  const [error, setError] = useState("");
  const [updateAccount, { isLoading }] = useUpdateAccountMutation();

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const toggleValue = (field, value) => {
    const values = form[field];
    updateField(
      field,
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  };

  const saveStep = async () => {
    const payload = Object.fromEntries(
      stepFields[step]
        .map((field) => [field, form[field]])
        .filter(
          ([, value]) => Array.isArray(value) || String(value).trim() !== "",
        ),
    );

    try {
      await updateAccount(payload).unwrap();
      if (step === steps.length - 1) {
        navigate("/", { replace: true });
      } else {
        setStep((current) => current + 1);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not save this step."));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br center from-emerald-50 via-white to-cyan-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <section className="md:rounded-3xl md:border border-slate-200 md:bg-white md:p-8 md:shadow-xl shadow-slate-200/60">
          <div>
            <img src="/logo.png" className="h-12 object-contain mb-2" alt="" />
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-950 sm:text-2xl">
                  {steps[step].title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {steps[step].description}
                </p>
              </div>
              <div className="hidden size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
                {step === 2 ? <Compass size={26} /> : <UserRound size={26} />}
              </div>
            </div>

            <div
              className="mt-6 grid grid-cols-3 gap-2"
              aria-label="Onboarding progress"
            >
              {steps.map((item, index) => (
                <div key={item.title} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      index <= step ? "bg-primary" : "bg-slate-200",
                    )}
                  />
                  {index < step && <Check size={14} className="text-primary" />}
                </div>
              ))}
            </div>
          </div>

          <div className="py-8">
            {step === 0 && (
              <PersonalStep form={form} updateField={updateField} />
            )}
            {step === 1 && (
              <DefaultsStep form={form} updateField={updateField} />
            )}
            {step === 2 && <TravelStep form={form} toggleValue={toggleValue} />}

            {error && (
              <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <footer className="pt-5 flex items-center justify-between gap-3 border-t border-slate-100">
            <Button
              variant="outline"
              disabled={step === 0 || isLoading}
              onClick={() => setStep((current) => current - 1)}
            >
              <ArrowLeft /> Back
            </Button>
            <div className="flx gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/", { replace: true })}
              >
                Skip for now
              </Button>
              <Button
                disabled={isLoading}
                onClick={saveStep}
                className="min-w-32"
              >
                {isLoading
                  ? "Saving..."
                  : step === 2
                    ? "Finish"
                    : "Save & continue"}
                {!isLoading && (step === 2 ? <Check /> : <ArrowRight />)}
              </Button>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
};

const PersonalStep = ({ form, updateField }) => (
  <div className="grid gap-5 sm:grid-cols-2">
    <FloatingInput
      name="date_of_birth"
      label="Date of birth"
      type="date"
      value={form.date_of_birth}
      max={new Date().toISOString().slice(0, 10)}
      onChange={(event) => updateField("date_of_birth", event.target.value)}
    />
    <FloatingSelect
      label="Gender"
      value={form.gender}
      onValueChange={(value) => updateField("gender", value)}
    >
      {genderOptions.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </FloatingSelect>
    <FloatingInput
      name="city"
      label="City"
      value={form.city}
      onChange={(event) => updateField("city", event.target.value)}
    />
    <FloatingSelect
      label="Country of residence"
      value={form.country_of_residence}
      onValueChange={(value) => updateField("country_of_residence", value)}
    >
      {COUNTRY_LIST.map((country) => (
        <SelectItem key={country.name} value={country.name}>
          {country.flag} {country.name}
        </SelectItem>
      ))}
    </FloatingSelect>
    <div className="sm:col-span-2 mt-2">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">
        Emergency contact
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <FloatingInput
          name="emergency_contact_name"
          label="Contact name"
          value={form.emergency_contact_name}
          onChange={(event) =>
            updateField("emergency_contact_name", event.target.value)
          }
        />
        <FloatingInput
          name="emergency_contact_phone"
          label="Phone number"
          type="tel"
          value={form.emergency_contact_phone}
          onChange={(event) =>
            updateField("emergency_contact_phone", event.target.value)
          }
        />
      </div>
    </div>
  </div>
);

const DefaultsStep = ({ form, updateField }) => (
  <div className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-3">
      <FloatingSelect
        label="Preferred language"
        value={form.preferred_language}
        onValueChange={(value) => updateField("preferred_language", value)}
      >
        {languageOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </FloatingSelect>
      <FloatingSelect
        label="Preferred currency"
        value={form.preferred_currency}
        onValueChange={(value) => updateField("preferred_currency", value)}
      >
        {currencies.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </FloatingSelect>
      <FloatingSelect
        label="Travel pace"
        value={form.travel_pace}
        onValueChange={(value) => updateField("travel_pace", value)}
      >
        {travelPaceOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </FloatingSelect>
    </div>

    <FloatingTextarea
      name="bio"
      label="A short bio"
      value={form.bio}
      maxLength={500}
      onChange={(event) => updateField("bio", event.target.value)}
    />
  </div>
);

const TravelStep = ({ form, toggleValue }) => (
  <div className="space-y-7">
    <ChoiceGroup
      title="Travel interests"
      description="Choose the experiences you usually seek out."
      options={interestOptions}
      values={form.travel_interests}
      onToggle={(value) => toggleValue("travel_interests", value)}
    />
    <ChoiceGroup
      title="Dietary preferences"
      description="Help us make more relevant food suggestions."
      options={dietaryOptions}
      values={form.dietary_preferences}
      onToggle={(value) => toggleValue("dietary_preferences", value)}
    />
    <ChoiceGroup
      title="Mobility and pacing"
      description="Select anything your plans should account for."
      options={mobilityOptions}
      values={form.mobility_constraints}
      onToggle={(value) => toggleValue("mobility_constraints", value)}
    />
  </div>
);

const ChoiceGroup = ({ title, description, options, values, onToggle }) => (
  <fieldset>
    <legend className="text-sm font-semibold text-slate-950">{title}</legend>
    <p className="mt-1 text-xs text-slate-500">{description}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(option)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-xs font-semibold transition focus:outline-none focus:ring-4 focus:ring-primary/10",
              selected
                ? "border-primary bg-primary text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-primary/50 hover:bg-primary/5",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  </fieldset>
);

export default OnboardingPage;
