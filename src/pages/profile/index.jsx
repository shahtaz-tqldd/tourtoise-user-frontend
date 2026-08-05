import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { FloatingTextarea } from "@/components/ui/textarea";
import TabMenu from "@/components/ui/tab";
import {
  usePublicAccountQuery,
  useUpdateAccountMutation,
} from "@/features/auth/authApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { COUNTRY_LIST } from "@/lib/countries";
import { getCloudinaryPreviewUrl } from "@/lib/utils";
import {
  Camera,
  GalleryVerticalEnd,
  Loader2,
  MapPin,
  PenLine,
  Settings,
  Sparkles,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Overview from "./overview";
import ProfileSettings from "./settings";
import TripProfile from "./travel_journal";

const mergeProfile = (account) => ({
  ...account,
  name: account?.name,
  username: account?.username,
  avatar: account?.avatar_url,
  city: account?.city,
  country: account?.country,
  bio: account?.bio,
  stats: [
    { label: "Trips", value: account?.trip_count },
    { label: "Countries", value: account?.visited_country_count },
    { label: "Journals", value: account?.journal_count },
  ],
});

const ProfilePage = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const currentUser = useSelector((state) => state.auth.user);

  const { data, isLoading, isFetching, refetch } =
    usePublicAccountQuery(username);
  const account = data?.data;
  const profile = useMemo(
    () => mergeProfile(account, username),
    [account, username],
  );
  const isSelfProfile =
    Boolean(currentUser?.username && username) &&
    currentUser.username === username;
  const isOwner = isSelfProfile || currentUser?.id === account?.id;

  if (isLoading || isFetching) {
    return <ProfileSkeleton />;
  }

  if (!account && data) {
    return <NoAccountExist />;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start pt-5 pb-20 md:pb-5">
      <ProfileOverview
        profile={profile}
        canEdit={isSelfProfile}
        onUpdated={refetch}
      />
      <div className="">
        <div className="min-w-0">
          <TabMenu
            tabs={[
              {
                label: "Overview",
                value: "overview",
                icon: GalleryVerticalEnd,
              },
              {
                label: "Travel Journal",
                value: "travel_days",
                icon: Sparkles,
              },
              { label: "Settings", value: "settings", icon: Settings },
            ]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            className="sticky top-14 lg:top-16 z-20 overflow-hidden md:rounded-t-2xl bg-white pt-2 -mx-4 px-4 md:mx-0"
          />

          <div>
            {activeTab === "overview" && (
              <Overview
                profile={profile}
                canEdit={isSelfProfile}
                onUpdated={refetch}
              />
            )}
            {activeTab === "travel_days" && (
              <TripProfile userId={account?.id} isOwner={isOwner} />
            )}
            {activeTab === "settings" && <ProfileSettings />}
          </div>
        </div>
      </div>
    </section>
  );
};

const ProfileOverview = ({ profile, canEdit = false, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [formState, setFormState] = useState(() =>
    getProfileOverviewFormState(profile),
  );
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  React.useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const displayLocation =
    profile.city && profile.country
      ? `${profile.city}, ${profile.country}`
      : "";

  const startEditing = () => {
    setFormState(getProfileOverviewFormState(profile));
    setAvatarFile(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setFormState(getProfileOverviewFormState(profile));
    setAvatarFile(null);
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const saveProfileOverview = async () => {
    const payload = new FormData();
    payload.append("bio", formState.bio.trim());
    payload.append("city", formState.city.trim());
    payload.append("country_of_residence", formState.country);

    if (avatarFile) {
      payload.append("profile_picture", avatarFile);
    }

    try {
      await updateAccount(payload).unwrap();
      await onUpdated?.();
      setIsEditing(false);
      setAvatarFile(null);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update profile."));
    }
  };

  return (
    <aside className="lg:sticky lg:top-[92px]">
      <Card className="relative">
        {canEdit &&
          (isEditing ? (
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isUpdating}
                onClick={cancelEditing}
                className="h-8 rounded-lg bg-white px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isUpdating}
                onClick={saveProfileOverview}
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
              onClick={startEditing}
              className="absolute left-4 top-4 z-10 rounded-full bg-white/90 text-slate-600 shadow-sm hover:text-primary"
              aria-label="Edit profile overview"
            >
              <PenLine size={16} />
            </Button>
          ))}
        <div className="bg-primary/10 h-36 -mx-6 -mt-6 overflow-hidden">
          <img src="/profile_bg.jpg" className="h-full w-full object-cover" />
        </div>
        <div className="-mt-16 flex flex-col items-center text-center">
          <div className="relative size-28 shrink-0">
            <img
              src={
                avatarPreview || getCloudinaryPreviewUrl(profile.avatar, 240)
              }
              alt={profile.name}
              className="h-full w-full object-cover rounded-3xl"
            />
            {isEditing && (
              <>
                <label
                  htmlFor="profile-avatar"
                  className="absolute -bottom-2 -right-2 center size-8 cursor-pointer rounded-full bg-white text-slate-700 shadow-sm"
                  aria-label="Update profile picture"
                >
                  <Camera size={16} />
                </label>
                <input
                  id="profile-avatar"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setAvatarFile(file);
                  }}
                />
              </>
            )}
          </div>

          <h1 className="mt-4 max-w-full truncate text-2xl font-bold text-slate-950">
            {profile.name}
          </h1>
          <span className="truncate text-sm text-primary">
            @{profile.username}
          </span>
          {isEditing ? (
            <div className="mt-5 w-full space-y-4 text-left">
              <FloatingTextarea
                name="bio"
                label="Bio"
                rows={4}
                value={formState.bio}
                onChange={(event) => updateField("bio", event.target.value)}
              />
              <FloatingInput
                name="city"
                label="City"
                value={formState.city}
                onChange={(event) => updateField("city", event.target.value)}
              />
              <FloatingSelect
                label="Country"
                value={formState.country}
                onValueChange={(value) => updateField("country", value)}
              >
                {COUNTRY_LIST.map((country) => (
                  <SelectItem key={country.name} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </FloatingSelect>
            </div>
          ) : (
            <>
              <div className="mt-4 flex max-w-full flex-col items-center gap-1.5 text-sm text-slate-500">
                <span className="inline-flex max-w-full items-center gap-1.5">
                  <MapPin size={15} />{" "}
                  {displayLocation ? (
                    <span className="truncate">{displayLocation}</span>
                  ) : (
                    <span className="text-slate-400">No Location found</span>
                  )}
                </span>
              </div>
              {profile.bio ? (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {profile.bio}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  No bio has been added to the profile
                </p>
              )}
            </>
          )}
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

const getProfileOverviewFormState = (profile = {}) => ({
  bio: profile.bio || "",
  city: profile.city || "",
  country: profile.country || "",
});

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
