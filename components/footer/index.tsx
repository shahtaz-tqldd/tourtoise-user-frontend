import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Github,
} from "lucide-react";
import Container from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logo.png"
                alt="Tortoise Logo"
                width={40}
                height={40}
                className="inline-block mr-2"
              />
              <span className="text-xl font-bold text-primary">tourtoise</span>
            </Link>
            <Typography size="sm" className="mb-10 max-w-md">
              Your personalized tour guide with AI assistance. Explore
              destinations, plan your trips, and get real-time guidance — all
              with the help of an intelligent travel assistant.
            </Typography>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <Typography as="h3" size="base" className="font-semibold mb-4">
              Quick Links
            </Typography>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/destinations"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="/planner"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Trip Planner
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <Typography as="h3" size="base" className="font-semibold mb-4">
              Contact
            </Typography>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600">
                <Mail size={18} className="mr-2 text-primary" />
                <span>hello@tourtoise.com</span>
              </li>
              <li className="flex items-center text-gray-600">
                <Phone size={18} className="mr-2 text-primary" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center text-gray-600">
                <MapPin size={18} className="mr-2 text-primary" />
                <span>123 Travel St, Adventure City</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <Typography size="xs" className="text-gray-500 text-sm">
            © {currentYear} tourtoise. All rights reserved.
          </Typography>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-primary text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 hover:text-primary text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-gray-500 hover:text-primary text-sm transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
