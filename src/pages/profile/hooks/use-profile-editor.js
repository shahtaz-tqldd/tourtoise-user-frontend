import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useUpdateAccountMutation } from "@/features/auth/authApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import {
  getChangedProfileFields,
  getOverviewFormState,
  getProfileCardFormState,
} from "../profile-form-state";

const useProfileEditor = ({ profile, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileCardFormState, setProfileCardFormState] = useState(() =>
    getProfileCardFormState(profile),
  );
  const [overviewFormState, setOverviewFormState] = useState(() =>
    getOverviewFormState(profile),
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();

  const changedFields = useMemo(
    () =>
      getChangedProfileFields({
        profile,
        profileCardFormState,
        overviewFormState,
      }),
    [overviewFormState, profile, profileCardFormState],
  );
  const hasChanges = avatarFile !== null || Object.keys(changedFields).length > 0;

  const resetDrafts = () => {
    setProfileCardFormState(getProfileCardFormState(profile));
    setOverviewFormState(getOverviewFormState(profile));
    setAvatarFile(null);
  };

  const startEditing = () => {
    resetDrafts();
    setIsEditing(true);
  };

  const cancelEditing = () => {
    resetDrafts();
    setIsEditing(false);
  };

  const saveChanges = async () => {
    if (!hasChanges || isUpdating) return;

    try {
      if (Object.keys(changedFields).length > 0) {
        await updateAccount(changedFields).unwrap();
      }

      if (avatarFile) {
        const avatarPayload = new FormData();
        avatarPayload.append("profile_picture", avatarFile);
        await updateAccount(avatarPayload).unwrap();
      }

      await onUpdated?.();
      setAvatarFile(null);
      setIsEditing(false);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update profile."));
    }
  };

  return {
    avatarFile,
    cancelEditing,
    hasChanges,
    isEditing,
    isUpdating,
    overviewFormState,
    profileCardFormState,
    saveChanges,
    setAvatarFile,
    setOverviewFormState,
    setProfileCardFormState,
    startEditing,
  };
};

export default useProfileEditor;
