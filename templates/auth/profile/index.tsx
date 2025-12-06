"use client";
import React, { useState } from "react";
import { User, Lock, Settings } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import BasicInfo from "./basic-info";
import PasswordUpdate from "./password-update";
import AccountSettings from "./account-settings";
import { UserData } from "./_types";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "account"
  >("profile");

  // User data state
  const [userData, setUserData] = useState<UserData>({
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    language: "en",
    timezone: "Asia/Dhaka",
    travel_style: ["adventure", "relaxed"],
    budget_level: "medium",
    prefered_group: ["solo", "friends"],
    food_preferences: ["halal", "vegan"],
    interests: ["museums", "nature", "hiking"],
    email_verified: true,
    account_type: "regular",
  });

  return (
    <section className="max-w-4xl mx-auto mt-28 px-4 pb-12">
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary text-2xl font-bold">
              {userData.first_name[0]}
              {userData.last_name[0]}
            </div>
            <div className="text-white">
              <Typography as="h2" className="text-white">
                {userData.first_name} {userData.last_name}
              </Typography>
              <Typography as="p" size="sm" className="text-white/75">
                {userData.email}
              </Typography>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2.5 px-6 py-4 font-medium transition-colors ${
                activeTab === "profile"
                  ? "border-b-2 border-primary/80 text-primary"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <User size={16} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2.5 px-6 py-4 font-medium transition-colors ${
                activeTab === "password"
                  ? "border-b-2 border-primary/80 text-primary"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Lock size={16} />
              Password
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-2.5 px-6 py-4 font-medium transition-colors ${
                activeTab === "account"
                  ? "border-b-2 border-primary/80 text-primary"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Settings size={16} />
              Account Settings
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="px-12 py-8">
          {/* Profile Tab */}
          {activeTab === "profile" && <BasicInfo userData={userData} />}

          {/* Password Tab */}
          {activeTab === "password" && <PasswordUpdate />}

          {/* Account Tab */}
          {activeTab === "account" && <AccountSettings />}
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
