import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell,
  Download,
  KeyRound,
  Laptop,
  LogOut,
  MapPin,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import ConfirmDialog from "@/components/shared/confirm-dialog";
import { SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/input";
import {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useUpdateAccountMutation,
} from "@/features/auth/authApiSlice";
import { resetApiState } from "@/features/api/apiSlice";
import { userLoggedOut } from "@/features/auth/authSlice";
import useAuth from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";

const getUserPreference = (user, keys, fallback) => {
  const value = keys
    .map((key) => user?.[key])
    .find((item) => item !== undefined);
  return typeof value === "boolean" ? value : fallback;
};

const getCurrentDevice = () => {
  if (typeof navigator === "undefined") return "Current browser";

  const platform = navigator.userAgentData?.platform || navigator.platform;
  const browser = navigator.userAgentData?.brands?.at(-1)?.brand;
  return [browser, platform].filter(Boolean).join(" on ") || "Current browser";
};

const formatLoginTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const ProfileSettings = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [updateAccount, { isLoading: isUpdatingAccount }] =
    useUpdateAccountMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] =
    useDeleteAccountMutation();

  const [preferenceOverrides, setPreferenceOverrides] = useState({});
  const [confirmState, setConfirmState] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const basePreferences = useMemo(
    () => ({
      locationSharing: getUserPreference(
        user,
        ["location_sharing", "location_sharing_enabled", "share_location"],
        false,
      ),
      notificationAlert: getUserPreference(
        user,
        [
          "notification_alert",
          "notification_alert_enabled",
          "receive_notification_alert",
        ],
        true,
      ),
    }),
    [user],
  );

  const preferences = useMemo(
    () => ({ ...basePreferences, ...preferenceOverrides }),
    [basePreferences, preferenceOverrides],
  );

  const activity = useMemo(
    () => [
      {
        label: "Current device",
        value: getCurrentDevice(),
        icon: Laptop,
      },
      {
        label: "Last login",
        value: formatLoginTime(user?.last_login || user?.lastLogin),
        icon: ShieldAlert,
      },
    ],
    [user],
  );

  const updatePreference = async (key, value) => {
    const payload =
      key === "locationSharing"
        ? { location_sharing_enabled: value }
        : { notification_alert_enabled: value };

    const previous = preferences[key];
    setPreferenceOverrides((current) => ({ ...current, [key]: value }));

    try {
      await updateAccount(payload).unwrap();
      toast.success("Settings updated.");
    } catch (error) {
      setPreferenceOverrides((current) => ({ ...current, [key]: previous }));
      toast.error(getApiErrorMessage(error, "Could not update settings."));
    }
  };

  const handleLocationToggle = (checked) => {
    setConfirmState({
      title: checked ? "Share your location?" : "Stop sharing location?",
      description: checked
        ? "tourtoise will be allowed to use your location to improve trip planning and nearby recommendations."
        : "tourtoise will stop using your location for personalized trip planning and nearby recommendations.",
      confirmLabel: checked ? "Enable sharing" : "Disable sharing",
      onConfirm: async () => {
        await updatePreference("locationSharing", checked);
        setConfirmState(null);
      },
    });
  };

  const handleNotificationToggle = (checked) => {
    updatePreference("notificationAlert", checked);
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword(data).unwrap();
      reset();
      setPasswordDialogOpen(false);
      toast.success("Password updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update password."));
    }
  };

  const handleLogout = () => {
    dispatch(userLoggedOut());
    dispatch(resetApiState());
    navigate("/login", { replace: true });
  };

  const handleDownloadData = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      account: user || {},
      settings: preferences,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tourtoise-account-data.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Account data downloaded.");
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap();
      toast.success("Account deleted.");
      handleLogout();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete account."));
    }
  };

  return (
    <>
      <Card className="space-y-10 p-6 md:p-8">
        <SectionHeader
          title="Profile Settings"
          description="Manage account preferences, password, and account access."
        />
        <div className="bg-primary/5 rounded-xl p-4 grid md:grid-cols-2 gap-6">
          {activity.map((item) => (
            <ActivityRow {...item} />
          ))}
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-x-6 gap-y-10">
          <SwitchRow
            icon={MapPin}
            title="Location sharing"
            description="Use location to tune trip planning and nearby recommendations."
            checked={preferences.locationSharing}
            disabled={isUpdatingAccount}
            onCheckedChange={handleLocationToggle}
          />
          <SwitchRow
            icon={Bell}
            title="Receive notification alerts"
            description="Get alerts for trip updates, reminders, and account activity."
            checked={preferences.notificationAlert}
            disabled={isUpdatingAccount}
            onCheckedChange={handleNotificationToggle}
          />
          <ActionRow
            icon={KeyRound}
            title="Update password"
            description="Change your password from a secure dialog."
            actionLabel="Update"
            onClick={() => setPasswordDialogOpen(true)}
          />
          <ActionRow
            icon={Download}
            title="Download data"
            description="Export a JSON copy of your account and settings."
            actionLabel="Download"
            onClick={handleDownloadData}
          />
          <ActionRow
            icon={LogOut}
            title="Logout"
            description="Sign out of this browser session."
            actionLabel="Logout"
            onClick={() =>
              setConfirmState({
                title: "Logout of Tourtoise?",
                description:
                  "You will need to sign in again before managing trips or profile settings.",
                confirmLabel: "Logout",
                onConfirm: handleLogout,
              })
            }
          />
          <ActionRow
            icon={Trash2}
            title="Delete account"
            description="Permanently remove your account and travel data."
            actionLabel="Delete"
            destructive
            className="border border-red-500 bg-red-500/5"
            onClick={() =>
              setConfirmState({
                title: "Delete your account?",
                description:
                  "This action is permanent. Your profile, trips, and saved travel data cannot be restored.",
                confirmLabel: "Delete account",
                variant: "destructive",
                onConfirm: handleDeleteAccount,
              })
            }
          />
        </div>
      </Card>

      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open);
          if (!open) reset();
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
            <DialogDescription className="leading-6">
              Use a strong password that you do not reuse elsewhere.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Controller
              name="current_password"
              control={control}
              rules={{ required: "Current password is required" }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Current Password"
                  type="password"
                  error={errors.current_password?.message}
                />
              )}
            />
            <Controller
              name="new_password"
              control={control}
              rules={{
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="New Password"
                  type="password"
                  error={errors.new_password?.message}
                />
              )}
            />
            <Controller
              name="confirm_password"
              control={control}
              rules={{
                required: "Confirm password is required",
                validate: (value, formValues) =>
                  value === formValues.new_password || "Passwords do not match",
              }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Confirm Password"
                  type="password"
                  error={errors.confirm_password?.message}
                />
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isChangingPassword}
                onClick={() => setPasswordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                <KeyRound />
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmState)}
        onOpenChange={(open) => !open && setConfirmState(null)}
        title={confirmState?.title}
        description={confirmState?.description}
        confirmLabel={confirmState?.confirmLabel}
        variant={confirmState?.variant}
        isLoading={isUpdatingAccount || isDeletingAccount}
        onConfirm={confirmState?.onConfirm}
      />
    </>
  );
};

const SwitchRow = ({
  icon,
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}) => {
  const Icon = icon;

  return (
    <div className="gap-4 flbx">
      <div className="flex min-w-0 gap-3">
        <div
          className={cn(
            "center size-10 shrink-0 rounded-full bg-primary/10 text-primary",
          )}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60",
          checked
            ? "border-primary bg-primary"
            : "border-slate-300 bg-slate-200",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition",
            checked ? "left-6" : "left-1",
          )}
        />
      </button>
    </div>
  );
};

const ActionRow = ({
  icon,
  title,
  description,
  actionLabel,
  onClick,
  destructive = false,
}) => {
  const Icon = icon;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl",
      )}
    >
      <div className="flex min-w-0 gap-3">
        <div
          className={cn(
            "center size-10 shrink-0 rounded-full",
            destructive
              ? "bg-red-100 text-red-600"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h3
            className={cn(
              "text-sm font-semibold text-slate-950",
              destructive ? "text-red-600" : "",
            )}
          >
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <Button
        type="button"
        variant={destructive ? "destructive" : "outline"}
        onClick={onClick}
        className="sm:w-28"
      >
        {actionLabel}
      </Button>
    </div>
  );
};

const ActivityRow = ({ icon, label, value }) => {
  const Icon = icon;
  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "center size-10 shrink-0 rounded-full bg-primary/10 text-primary",
        )}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">{label}</p>
        <p className="mt-1 break-words text-sm leading-6 text-slate-500">
          {value}
        </p>
      </div>
    </div>
  );
};

export default ProfileSettings;
