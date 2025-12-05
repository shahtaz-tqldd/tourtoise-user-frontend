import React from "react";
import {
  Mail,
  MapPin,
  Globe,
  Clock,
  Users,
  Utensils,
  Heart,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BasicInfo = ({ userData, onUpdateClick }) => {
  const formatArray = (arr) => {
    if (!arr || arr.length === 0) return "Not specified";
    return arr
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
      .join(", ");
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-1">
        <Icon size={18} className="text-gray-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-base text-gray-900">{value || "Not specified"}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Basic Information
        </h2>
        <Button onClick={onUpdateClick}>Update Profile</Button>
      </div>

      <div className="space-y-1 divide-y divide-gray-100">
        {/* Personal Information */}
        <div className="grid md:grid-cols-2 gap-x-8">
          <InfoRow
            icon={Mail}
            label="Full Name"
            value={`${userData.first_name} ${userData.last_name || ""}`}
          />
          <InfoRow icon={Mail} label="Email" value={userData.email} />
        </div>

        {/* Localization */}
        <div className="grid md:grid-cols-2 gap-x-8 pt-4">
          <InfoRow
            icon={Globe}
            label="Language"
            value={
              userData.language === "en"
                ? "English"
                : userData.language === "bn"
                ? "Bengali"
                : userData.language
            }
          />
          <InfoRow icon={Clock} label="Timezone" value={userData.timezone} />
        </div>

        {/* Travel Preferences */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Travel Preferences
          </h3>
          <div className="grid md:grid-cols-2 gap-x-8">
            <InfoRow
              icon={Heart}
              label="Travel Style"
              value={formatArray(userData.travel_style)}
            />
            <InfoRow
              icon={DollarSign}
              label="Budget Level"
              value={
                userData.budget_level
                  ? userData.budget_level.charAt(0).toUpperCase() +
                    userData.budget_level.slice(1)
                  : "Not specified"
              }
            />
            <InfoRow
              icon={Users}
              label="Preferred Group"
              value={formatArray(userData.prefered_group)}
            />
            <InfoRow
              icon={Utensils}
              label="Food Preferences"
              value={formatArray(userData.food_preferences)}
            />
          </div>
          <div className="pt-3">
            <InfoRow
              icon={MapPin}
              label="Interests"
              value={formatArray(userData.interests)}
            />
          </div>
        </div>

        {/* Account Status */}
        <div className="grid md:grid-cols-2 gap-x-8 pt-4">
          <div className="flex items-start gap-3 py-3">
            <div className="mt-1">
              <Mail size={18} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Email Verification
              </p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userData.email_verified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {userData.email_verified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
          <InfoRow
            icon={Users}
            label="Account Type"
            value={
              userData.account_type
                ? userData.account_type.charAt(0).toUpperCase() +
                  userData.account_type.slice(1)
                : "Regular"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
