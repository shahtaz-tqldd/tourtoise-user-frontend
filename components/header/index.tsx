import React from "react";
import Container from "../ui/container";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";

const Header = () => {
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
            <span className="text-xl font-bold text-emerald-600">
              tourtoise
            </span>
          </Link>

          <div className="flx gap-8 text-sm font-medium text-gray-600">
            <Link href="/">Destinations</Link>
            <Link href="/">About</Link>
            <Link href="/">Pricing</Link>
            <Link href="/">FAQ</Link>
          </div>

          <div className="flx gap-3">
            <Link href="/login">
              <Button variant="outline" className="rounded-full">
                AI Agent
              </Button>
            </Link>
            <Button className="rounded-full">Get Started</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
