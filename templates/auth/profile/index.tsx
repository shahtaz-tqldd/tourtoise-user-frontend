"use client";
import React, { useState } from "react";
import {
  User,
  Lock,
  Trash2,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Plane,
} from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import BasicInfo from "./basic-info";
import PasswordUpdate from "./password-update";

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  language: string;
  timezone: string;
  travel_style: string[];
  budget_level: string;
  prefered_group: string[];
  food_preferences: string[];
  interests: string[];
  email_verified: boolean;
  account_type: string;
}

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "account"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic here
    console.log("Profile updated:", userData);
    setIsEditing(false);
  };

  const handleUpdateClick = () => {
    console.log("Update profile clicked");
    // This will open your modal in the parent component
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password change logic here
    console.log("Password change requested");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleAccountDelete = () => {
    // Handle account deletion logic here
    console.log("Account deleted");
    setShowDeleteConfirm(false);
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log("User logged out");
  };

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
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "profile"
                  ? "border-b-2 border-primary/80 text-primary"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <User size={20} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "password"
                  ? "border-b-2 border-primary/80 text-primary"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Lock size={20} />
              Password
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === "account"
                  ? "border-b-2 border-primary/80 text-primary"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Trash2 size={20} />
              Account
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="px-12 py-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <BasicInfo userData={userData} onUpdateClick={handleUpdateClick} />
          )}

          {/* Password Tab */}
          {activeTab === "password" && <PasswordUpdate />}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="max-w-md space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Account Actions
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Logout</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    End your current session and return to the login page.
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">
                    Delete Account
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-red-900">
                        Are you absolutely sure?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAccountDelete}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
