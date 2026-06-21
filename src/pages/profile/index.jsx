import Card from "@/components/ui/card";
import TabMenu from "@/components/ui/tab";
import { usePublicAccountQuery } from "@/features/auth/authApiSlice";
import { getCloudinaryPreviewUrl } from "@/lib/utils";
import {
  Camera,
  GalleryVerticalEnd,
  MapPin,
  Settings,
  Sparkles,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Overview from "./overview";
import ProfileSettings from "./settings";
import TripProfile from "./travel_journal";

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
  const currentUser = useSelector((state) => state.auth.user);

  const { data, isLoading, isFetching } = usePublicAccountQuery(username);
  const account = data?.data;
  const profile = useMemo(
    () => mergeProfile(account, username),
    [account, username],
  );
  const isOwner =
    currentUser?.id === account?.id ||
    currentUser?.username === account?.username;

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
            { label: "Overview", value: "overview", icon: GalleryVerticalEnd },
            {
              label: "Travel Journal",
              value: "travel_days",
              icon: Sparkles,
            },
            { label: "Settings", value: "settings", icon: Settings },
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div>
          {activeTab === "overview" && <Overview profile={profile} />}
          {activeTab === "travel_days" && (
            <TripProfile userId={account?.id} isOwner={isOwner} />
          )}
          {activeTab === "settings" && <ProfileSettings />}
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
