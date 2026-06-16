import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import TabMenu from "@/components/ui/tab";
import { usePublicAccountQuery } from "@/features/auth/authApiSlice";
import {
  Bell,
  Camera,
  CheckCircle2,
  Compass,
  Eye,
  Globe2,
  KeyRound,
  LockKeyhole,
  MapPin,
  Mountain,
  Plane,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const demoProfile = {
  name: "Maya Rahman",
  username: "maya.travels",
  location: "Dhaka, Bangladesh",
  bio: "Slow travel planner, food walk collector, and weekend mountain chaser.",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80",
  stats: [
    { label: "Trips", value: "24" },
    { label: "Countries", value: "9" },
    { label: "Saved", value: "138" },
  ],
};

const tripPreferences = [
  { label: "Nature trails", value: "Primary", icon: Mountain },
  { label: "Local food", value: "High", icon: Compass },
  { label: "Direct flights", value: "Preferred", icon: Plane },
  { label: "Walkable stays", value: "Required", icon: MapPin },
];

const preferenceChips = [
  "Boutique stays",
  "Public transport",
  "Early starts",
  "Museums",
  "Hidden cafes",
  "Light packing",
];

const alertOptions = [
  {
    label: "Trip reminders",
    description: "Packing, check-in, and visa tasks.",
  },
  { label: "Price alerts", description: "Flight and hotel price movement." },
  { label: "Safety alerts", description: "Weather and route advisories." },
];

const locationOptions = [
  {
    label: "Share live location during trips",
    description:
      "Trusted companions can view your route while a trip is active.",
  },
  {
    label: "Use location for nearby suggestions",
    description: "Show restaurants, stations, and attractions around you.",
  },
];

const mergeProfile = (account) => ({
  ...demoProfile,
  ...account,
  name: account?.name,
  username: account?.username,
  avatar: account?.avatar_url,
  location: account?.location || account?.city || demoProfile.location,
  bio: account?.bio || demoProfile.bio,
});

const ProfilePage = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("preferences");

  const { data, isLoading, isFetching } = usePublicAccountQuery(username);
  const account = data?.data;
  const profile = useMemo(
    () => mergeProfile(account, username),
    [account, username],
  );

  if (isLoading || isFetching) {
    return <ProfileSkeleton />;
  }

  if (!account && data) {
    return <NoAccountExist />;
  }

  return (
    <section className="grid gap-6 py-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
      <ProfileOverview profile={profile} />

      <div className="min-w-0 space-y-6">
        <TabMenu
          tabs={[
            { label: "Preferences", value: "preferences", icon: Compass },
            { label: "Security", value: "security", icon: ShieldCheck },
            { label: "Alerts", value: "alerts", icon: Bell },
            { label: "Location", value: "location", icon: Globe2 },
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div>
          {activeTab === "preferences" && <PreferencesPanel />}
          {activeTab === "security" && <SecurityPanel />}
          {activeTab === "alerts" && <AlertsPanel />}
          {activeTab === "location" && <LocationPanel />}
        </div>
      </div>
    </section>
  );
};

const ProfileOverview = ({ profile }) => {
  return (
    <aside className="rounded-2xl md:rounded-[28px] overflow-hidden bg-white p-5 lg:sticky lg:top-5">
      <div className="bg-primary/10 h-28 -mx-5 -mt-5"></div>
      <div className="-mt-16 flex flex-col items-center text-center">
        <div className="relative size-28 shrink-0">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="h-full w-full object-cover rounded-3xl"
          />
          <button
            type="button"
            className="absolute -bottom-2 -right-2 center size-8 rounded-full bg-white text-slate-700 shadow-sm"
            aria-label="Update profile picture"
          >
            <Camera size={16} />
          </button>
        </div>

        <h1 className="mt-4 max-w-full truncate text-2xl font-bold text-slate-950">
          {profile.name}
        </h1>
        <span className="truncate text-sm text-primary">@{profile.username}</span>
        <div className="mt-4 flex max-w-full flex-col items-center gap-1.5 text-sm text-slate-500">
          <span className="inline-flex max-w-full items-center gap-1.5">
            <MapPin size={15} />{" "}
            <span className="truncate">{profile.location}</span>
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{profile.bio}</p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-2">
        {profile.stats.map((stat) => (
          <div key={stat.label} className="min-w-0 px-2 py-2 text-center">
            <p className="text-lg font-bold text-slate-950">{stat.value}</p>
            <p className="truncate text-xs font-medium text-slate-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
};

const PreferencesPanel = () => (
  <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
    <Panel title="Trip Preferences" icon={Compass}>
      <div className="grid gap-3 sm:grid-cols-2">
        {tripPreferences.map((preference) => {
          const Icon = preference.icon;

          return (
            <div
              key={preference.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="center size-10 rounded-full bg-white text-primary">
                  <Icon size={18} />
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {preference.value}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-950">
                {preference.label}
              </h3>
            </div>
          );
        })}
      </div>
    </Panel>

    <Panel title="Travel Style" icon={CheckCircle2}>
      <div className="flex flex-wrap gap-2">
        {preferenceChips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-primary/10 p-4">
        <p className="text-sm font-semibold text-slate-950">Budget range</p>
        <p className="mt-1 text-sm text-slate-600">
          Mid-range stays, flexible transport, and local experiences first.
        </p>
      </div>
    </Panel>
  </div>
);

const SecurityPanel = () => (
  <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
    <Panel title="Update Password" icon={KeyRound}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          type="password"
          placeholder="Current password"
          className="h-12 rounded-xl bg-slate-50"
        />
        <Input
          type="password"
          placeholder="New password"
          className="h-12 rounded-xl bg-slate-50"
        />
        <Input
          type="password"
          placeholder="Confirm password"
          className="h-12 rounded-xl bg-slate-50"
        />
      </div>
      <Button className="mt-5">
        <LockKeyhole size={16} /> Save Password
      </Button>
    </Panel>

    <Panel title="Two-Factor Auth" icon={ShieldCheck}>
      <SettingRow
        icon={Smartphone}
        title="Authenticator app"
        description="Require a six digit code when signing in."
        checked
      />
      <SettingRow
        icon={Eye}
        title="Remember trusted devices"
        description="Skip verification for devices you use often."
      />
    </Panel>
  </div>
);

const AlertsPanel = () => (
  <Panel title="Alert Settings" icon={Bell}>
    <div className="grid gap-3 md:grid-cols-3">
      {alertOptions.map((option, index) => (
        <SettingRow
          key={option.label}
          icon={Bell}
          title={option.label}
          description={option.description}
          checked={index !== 1}
        />
      ))}
    </div>
  </Panel>
);

const LocationPanel = () => (
  <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
    <Panel title="Location Sharing" icon={MapPin}>
      <div className="grid gap-3 md:grid-cols-2">
        {locationOptions.map((option, index) => (
          <SettingRow
            key={option.label}
            icon={Globe2}
            title={option.label}
            description={option.description}
            checked={index === 1}
          />
        ))}
      </div>
    </Panel>

    <Panel title="Visibility" icon={Eye}>
      <div className="space-y-3">
        <PrivacyOption label="Public profile" checked />
        <PrivacyOption label="Show visited countries" checked />
        <PrivacyOption label="Show upcoming trip dates" />
      </div>
    </Panel>
  </div>
);

const Panel = ({ title, icon, children }) => {
  const Icon = icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="center size-10 rounded-full bg-primary/10 text-primary">
          <Icon size={18} />
        </div>
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
      </div>
      {children}
    </div>
  );
};

const SettingRow = ({ icon, title, description, checked = false }) => {
  const Icon = icon;

  return (
    <label className="flex h-full cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="center size-10 shrink-0 rounded-full bg-white text-primary">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <Checkbox defaultChecked={checked} />
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </label>
  );
};

const PrivacyOption = ({ label, checked = false }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    <Checkbox defaultChecked={checked} />
  </label>
);

const ProfileSkeleton = () => (
  <section className="space-y-6 py-5">
    <div className="h-80 animate-pulse rounded-3xl bg-slate-100" />
    <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
      <div className="h-64 animate-pulse rounded-3xl bg-slate-100" />
    </div>
  </section>
);

const NoAccountExist = () => {
  return (
    <div className="center min-h-[55vh] rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">
      <div>
        <h1 className="text-xl font-bold text-slate-950">Account not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The profile you are looking for is unavailable.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
