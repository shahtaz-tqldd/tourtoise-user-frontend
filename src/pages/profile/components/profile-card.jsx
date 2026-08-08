import React, { useMemo } from "react";

import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { FloatingTextarea } from "@/components/ui/textarea";

import { COUNTRY_LIST } from "@/lib/countries";
import { getCloudinaryPreviewUrl, getInitials } from "@/lib/utils";
import { Camera, MapPin } from "lucide-react";
import ProfileEditActions from "./profile-edit-actions";

const BIO_WORD_LIMIT = 60;

const getWordCount = (value = "") => value.trim().match(/\S+/g)?.length || 0;

const limitWords = (value, limit) => {
  const words = [...value.matchAll(/\S+/g)];
  if (words.length <= limit) return value;

  const lastWord = words[limit - 1];
  return value.slice(0, lastWord.index + lastWord[0].length);
};

const ProfileCard = ({
  profile,
  canEdit = false,
  isEditing,
  onStartEditing,
  avatarFile,
  onAvatarFileChange,
  formState,
  onFormStateChange,
  hasChanges,
  isUpdating,
  onSaveChanges,
  onCancelEditing,
}) => {
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
  const bioWordCount = getWordCount(formState.bio);

  const updateField = (field, value) => {
    onFormStateChange((current) => ({ ...current, [field]: value }));
  };

  return (
    <aside className="lg:sticky lg:top-[92px]">
      <Card className="relative -mx-4 md:mx-0 rounded-none -mt-5 md:mt-0">
        <div className="bg-primary/10 h-28 -mx-6 -mt-6 overflow-hidden">
          <img src="/profile_bg.jpg" className="h-full w-full object-cover" />
        </div>
        <div className="-mt-16 flex flex-col items-center text-center">
          <div className="relative size-28 shrink-0">
            {avatarPreview || profile.avatar ? (
              <img
                src={
                  avatarPreview || getCloudinaryPreviewUrl(profile.avatar, 240)
                }
                alt={profile.name}
                className="h-full w-full object-cover rounded-3xl"
              />
            ) : (
              <div className="h-full w-full center bg-gradient-to-br from-cyan-100 border-3 border-white to-amber-100 rounded-3xl">
                <h2 className="font-semibold text-primary text-2xl">{getInitials(profile.name)}</h2>
              </div>
            )}
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
                    if (file) onAvatarFileChange(file);
                  }}
                />
              </>
            )}
          </div>
          <div className="mt-4 w-full">
            {!isEditing ? (
              <>
                <h1 className="truncate text-2xl font-bold text-slate-950">
                  {profile.name}
                </h1>
                <span className="truncate text-sm text-primary">
                  @{profile.username}
                </span>
              </>
            ) : (
              <FloatingInput
                name="name"
                label="Name"
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            )}
          </div>
          {isEditing ? (
            <div className="mt-5 w-full space-y-4 text-left">
              <div>
                <FloatingTextarea
                  name="bio"
                  label="Bio"
                  rows={4}
                  value={formState.bio}
                  aria-describedby="bio-word-count"
                  onChange={(event) =>
                    updateField(
                      "bio",
                      limitWords(event.target.value, BIO_WORD_LIMIT),
                    )
                  }
                />
                <p
                  id="bio-word-count"
                  className="mt-1.5 text-right text-xs font-medium text-slate-400"
                  aria-live="polite"
                >
                  {bioWordCount} / {BIO_WORD_LIMIT} words
                </p>
              </div>
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
                    <span className="text-slate-400">Address was not added</span>
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

        {!isEditing ? (
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
        ) : null}

        {canEdit ? (
          isEditing ? (
            <ProfileEditActions
              canSave={hasChanges}
              isSaving={isUpdating}
              onSave={onSaveChanges}
              onCancel={onCancelEditing}
              className="hidden md:block"
            />
          ) : (
            <Button
              className="w-full mt-5"
              variant="outline"
              onClick={onStartEditing}
            >
              Edit Profile
            </Button>
          )
        ) : null}
      </Card>
    </aside>
  );
};

export default ProfileCard;
