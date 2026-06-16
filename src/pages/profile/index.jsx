import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import TabMenu from "@/components/ui/tab";
import { usePublicAccountQuery } from "@/features/auth/authApiSlice";
import { cn, getCloudinaryPreviewUrl } from "@/lib/utils";
import {
  Bell,
  Camera,
  Compass,
  Eye,
  Globe2,
  KeyRound,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Overview from "./overview";

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
  const [activeTab, setActiveTab] = useState("overview");

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
            { label: "Overview", value: "overview", icon: Compass },
            { label: "Bucket List", value: "bucket_list", icon: ShieldCheck },
            { label: "Settings", value: "settings", icon: Bell },
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div>
          {activeTab === "overview" && <Overview />}
          {activeTab === "bucket_list" && <SecurityPanel />}
          {activeTab === "settings" && <AlertsPanel />}
        </div>
      </div>
    </section>
  );
};

const ProfileOverview = ({ profile }) => {
  return (
    <aside className="lg:sticky lg:top-5">
      <Card>
        <div className="bg-primary/10 h-28 -mx-6 -mt-6"></div>
        <div className="-mt-16 flex flex-col items-center text-center">
          <div className="relative size-28 shrink-0">
            <img
              src={getCloudinaryPreviewUrl(profile.avatar, 240)}
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
          <span className="truncate text-sm text-primary">
            @{profile.username}
          </span>
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
      </Card>
    </aside>
  );
};

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

    <Panel className="space-y-4" title="Two-Factor Auth" icon={ShieldCheck}>
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

const Panel = ({ title, icon, children, className }) => {
  const Icon = icon;

  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
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
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
