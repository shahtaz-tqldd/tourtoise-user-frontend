import BrokenPage from "@/components/shared/broken-page";

import TabMenu from "@/components/ui/tab";
import { usePublicAccountQuery } from "@/features/auth/authApiSlice";

import { GalleryVerticalEnd, Gift, Settings, UserRoundX } from "lucide-react";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";

import Overview from "./components/overview";
import ProfileSettings from "./components/settings";
import CreditHistory from "./components/credit-history";
import ProfileCard from "./components/profile-card";
import ProfileEditActions from "./components/profile-edit-actions";
import useProfileEditor from "./hooks/use-profile-editor";
import { useMediaQuery } from "@/lib/mobile-visible";

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
  const isMobile = useMediaQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = ["overview", "credit_history", "settings"].includes(
    requestedTab,
  )
    ? requestedTab
    : "overview";
  const currentUser = useSelector((state) => state.auth.user);

  const { data, error, isLoading, isFetching, isError, refetch } =
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
  const editor = useProfileEditor({ profile, onUpdated: refetch });

  if (isLoading || isFetching) {
    return <ProfileSkeleton />;
  }

  if (error?.status === 404 || (!account && data)) {
    return (
      <BrokenPage
        title="Account not found"
        description={`We couldn't find a profile for @${username} Check the username or explore somewhere else.`}
        icon={UserRoundX}
        actionLabel="Explore destinations"
      />
    );
  }

  if (isError) {
    return (
      <BrokenPage
        statusCode="Oops"
        title="Could not load this profile"
        description="Something interrupted the request. Check your connection and try again."
        icon={UserRoundX}
        actionLabel="Back to home"
        onRetry={refetch}
      />
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start pt-5 pb-20 md:pb-5">
      <ProfileCard
        profile={profile}
        canEdit={isSelfProfile}
        isEditing={editor.isEditing}
        onStartEditing={editor.startEditing}
        avatarFile={editor.avatarFile}
        onAvatarFileChange={editor.setAvatarFile}
        formState={editor.profileCardFormState}
        onFormStateChange={editor.setProfileCardFormState}
        hasChanges={editor.hasChanges}
        isUpdating={editor.isUpdating}
        onSaveChanges={editor.saveChanges}
        onCancelEditing={editor.cancelEditing}
      />
      {!isMobile ? (
        <div className="min-w-0">
          <TabMenu
            tabs={[
              {
                label: "Overview",
                value: "overview",
                icon: GalleryVerticalEnd,
              },
              {
                label: "Credit History",
                value: "credit_history",
                icon: Gift,
              },
              { label: "Settings", value: "settings", icon: Settings },
            ]}
            activeTab={activeTab}
            setActiveTab={(tab) => {
              const nextParams = new URLSearchParams(searchParams);
              if (tab === "overview") nextParams.delete("tab");
              else nextParams.set("tab", tab);
              setSearchParams(nextParams, { replace: true });
            }}
            className="sticky top-14 lg:top-16 z-20 overflow-hidden md:rounded-t-2xl bg-white pt-2 -mx-4 px-4 md:mx-0"
          />

          <div>
            {activeTab === "overview" && (
              <Overview
                profile={profile}
                isEditing={editor.isEditing}
                formState={editor.overviewFormState}
                onFormStateChange={editor.setOverviewFormState}
              />
            )}
            {activeTab === "credit_history" && (
              <CreditHistory userId={account?.id} isOwner={isOwner} />
            )}
            {activeTab === "settings" && <ProfileSettings />}
          </div>
        </div>
      ) : (
        <div className="-mb-4">
          <Overview
            profile={profile}
            isEditing={editor.isEditing}
            formState={editor.overviewFormState}
            onFormStateChange={editor.setOverviewFormState}
          />
          {isSelfProfile && editor.isEditing ? (
            <ProfileEditActions
              className="mt-10"
              canSave={editor.hasChanges}
              isSaving={editor.isUpdating}
              onSave={editor.saveChanges}
              onCancel={editor.cancelEditing}
            />
          ) : null}
        </div>
      )}
    </section>
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

export default ProfilePage;
