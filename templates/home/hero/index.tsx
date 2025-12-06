"use client";

import React from "react";
import { MapPin, SlidersHorizontal } from "lucide-react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { features, popularSearches } from "./_data";

// Animation variants
const heroVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
    },
  }),
};

const featureContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4,
    },
  },
};

const featureItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

// Components
const FeatureCards: React.FC = () => {
  return (
    <motion.div
      variants={featureContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
    >
      {features.map((feature) => {
        const IconComponent = feature.icon;
        return (
          <motion.div
            key={feature.id}
            variants={featureItemVariants}
            className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-gray-200/40 border border-gray-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex gap-4 items-start">
              <div
                className={`${feature.iconBgColor} rounded-xl p-3 flex-shrink-0`}
              >
                <IconComponent className={feature.iconColor} size={22} />
              </div>
              <div className="text-left">
                <h2 className="font-semibold text-gray-800 text-sm">
                  {feature.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

const PopularSearchButtons: React.FC = () => {
  return (
    <motion.div
      variants={heroVariants}
      custom={3}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap items-center gap-1.5 mt-6"
    >
      <span className="text-sm text-gray-500 font-medium">Popular Search:</span>
      {popularSearches.map((search) => (
        <button
          key={search.id}
          className="py-1.5 px-4 text-xs border border-gray-400/50 bg-white/60 text-gray-600 rounded-full hover:border-primary/75 hover:text-primary hover:bg-emerald-50/50 transition-all"
        >
          {search.name}
        </button>
      ))}
    </motion.div>
  );
};

const SearchBar: React.FC = () => {
  return (
    <motion.div
      variants={heroVariants}
      custom={2}
      initial="hidden"
      animate="visible"
      className="bg-white/90 backdrop-blur-md shadow-xl shadow-gray-200/50 rounded-2xl p-2 flex items-center gap-2 max-w-2xl mt-16 w-full border border-gray-100/50"
    >
      <div className="flex items-center gap-3 flex-1 px-3">
        <MapPin size={20} className="text-gray-400 flex-shrink-0" />
        <input
          className="flex-1 focus:outline-none text-gray-700 placeholder:text-gray-400 bg-transparent py-2"
          placeholder="Search destinations (e.g., Bali, Rome, Tokyo)"
        />
      </div>

      <button className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl h-11 w-11 flex items-center justify-center flex-shrink-0">
        <SlidersHorizontal size={18} className="text-gray-600" />
      </button>

      <Button className="flex-shrink-0">Explore</Button>
    </motion.div>
  );
};

const HeroContent: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center max-w-3xl mx-auto relative z-10">
      <motion.div
        variants={heroVariants}
        custom={0}
        initial="hidden"
        animate="visible"
      >
        <Image src="/logo.png" height={80} width={80} alt="tourtoise logo" />
      </motion.div>

      <motion.div
        variants={heroVariants}
        custom={1}
        initial="hidden"
        animate="visible"
      >
        <Typography
          as="h1"
          size="xxl"
          className="mt-6 leading-[1.15] max-w-2xl !font-bold bg-gradient-to-br from-yellow-500 via-emerald-600 to-purple-500 bg-clip-text text-transparent"
        >
          Your personalized tour guide with AI assistance
        </Typography>
        <Typography
          as="p"
          size="base"
          className="mt-4 max-w-2xl mx-auto leading-relaxed"
        >
          Explore destinations, plan your trips, and get real-time guidance —
          all with the help of an intelligent travel assistant.
        </Typography>
      </motion.div>

      <SearchBar />
      <PopularSearchButtons />
    </div>
  );
};

// Main Hero Component
const Hero: React.FC = () => {
  return (
    <Container
      className="relative z-0 !pt-32"
      style={{
        backgroundImage: 'url("/bg.jpg")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <HeroContent />
      <FeatureCards />
    </Container>
  );
};

export default Hero;
