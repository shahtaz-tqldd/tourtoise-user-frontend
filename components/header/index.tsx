"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
import { useSelector } from "react-redux";
import { User } from "lucide-react";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
}

const Header = () => {
  const { user, isAuthenticated } = useSelector(
    (state: { user: { user: UserProfile | null; isAuthenticated: boolean } }) =>
      state.user
  );

  console.log(user, isAuthenticated);

  return (
    <header className="fixed top-5 w-full z-10">
      <div className="max-w-4xl mx-auto bg-white py-4 px-6 rounded-full">
        <div className="flbx">
          <Link href="/" className="flx">
            <Image
              src="/logo.png"
              alt="Tortoise Logo"
              width={40}
              height={40}
              className="inline-block mr-2"
            />
            <span className="text-xl font-bold text-primary">tourtoise</span>
          </Link>

          <div className="flx gap-6 font-medium text-gray-600">
            <Link href="/">Destinations</Link>
            <Link href="/">About</Link>
            <Link href="/">Pricing</Link>
            <Link href="/">FAQ</Link>
          </div>

          <div className="flx gap-3">
            <Button variant="outline" className="rounded-full">
              AI Agent
            </Button>
            {isAuthenticated ? (
              <Link
                href="/shahtaz"
                className="h-10 w-10 bg-primary/5 hover:bg-primary/10 rounded-full border border-primary center hover:ring-[3px] hover:ring-primary/20 tr"
              >
                <User size={18} className="text-primary" />
              </Link>
            ) : (
              <Link href="/login">
                <Button className="rounded-full">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
