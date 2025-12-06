import React from "react";
import { Button } from "@/components/ui/button";
import { userLoggedOut } from "@/store/slices/auth-slice";
import { LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Switch } from "@/components/ui/switch";
import { Typography } from "@/components/ui/typography";

const AccountSettings = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const handleLogout = () => {
    dispatch(userLoggedOut());
    router.push("/");
  };
  return (
    <div>
      <Typography as="h3" size="base">
        Account Settings
      </Typography>

      <div className="space-y-8 mt-12">
        <div className="flbx">
          <div className="max-w-md space-y-2">
            <Typography as="h3" size="sm">
              Location Sharing
            </Typography>
            <Typography as="p" size="xs">
              The application will track your current location and provide you
              suggestion based on that
            </Typography>
          </div>
          <Switch />
        </div>
        <div className="flbx">
          <div className="max-w-md space-y-2">
            <Typography as="h3" size="sm">
              2 Factor Authentication
            </Typography>
            <Typography as="p" size="xs">
              Secure your account by providing 2 factor authentication
            </Typography>
          </div>
          <Switch />
        </div>
      </div>
      <hr className="my-6" />
      <div className="space-y-4">
        <div className="border rounded-lg p-6 flex justify-between items-end">
          <div className="max-w-md space-y-2">
            <Typography as="h3" size="sm">
              Logout
            </Typography>
            <Typography as="p" size="xs">
              End your current session and return to the login page.
            </Typography>
          </div>
          <Button onClick={() => handleLogout()} variant="outline">
            <LogOut size={18} />
            Logout
          </Button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex justify-between items-end">
          <div className="max-w-md space-y-2">
            <Typography as="h3" size="sm" className="!text-red-700">
              Delete Account
            </Typography>
            <Typography as="p" size="xs" className="!text-red-600">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </Typography>
          </div>

          <Button variant="destructive">
            <Trash2 size={18} />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
