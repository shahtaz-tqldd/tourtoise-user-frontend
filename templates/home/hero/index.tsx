"use client";

import React from "react";
import { MapPin, SlidersHorizontal, Compass, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <Container className="relative z-0 py-20">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image src="/logo.png" height={80} width={80} alt="tourtoise logo" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Typography
            as="h1"
            size="xxl"
            className="mt-8 leading-[1.15] max-w-2xl !font-bold bg-gradient-to-br from-green-400 via-emerald-600 to-cyan-500 bg-clip-text text-transparent"
          >
            Your personalized tour guide with AI assistance
          </Typography>
          <Typography
            as="p"
            size="base"
            className="mt-6 text-gray-500 max-w-xl mx-auto leading-relaxed"
          >
            Explore destinations, plan your trips, and get real‑time guidance —
            all with the help of an intelligent travel assistant.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/90 backdrop-blur-md shadow-xl shadow-gray-200/50 rounded-2xl p-2 flex items-center gap-2 max-w-2xl mt-10 w-full border border-gray-100/50"
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap items-center gap-1.5 mt-6"
        >
          <span className="text-sm text-gray-500 font-medium">Popular:</span>
          <button className="py-1.5 px-4 text-xs border border-gray-400/50 bg-white/60 text-gray-600 rounded-full hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all">
            Bali
          </button>
          <button className="py-1.5 px-4 text-xs border border-gray-400/50 bg-white/60 text-gray-600 rounded-full hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all">
            Nepal
          </button>
          <button className="py-1.5 px-4 text-xs border border-gray-400/50 bg-white/60 text-gray-600 rounded-full hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all">
            Phi Phi Island
          </button>
          <button className="py-1.5 px-4 text-xs border border-gray-400/50 bg-white/60 text-gray-600 rounded-full hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all">
            Sundarban
          </button>
        </motion.div>
      </div>

      {/* Left floating card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="hidden lg:block absolute -mt-24 bg-white/60 backdrop-blur-md rounded-2xl p-6 pl-4 shadow-xl shadow-gray-200/40 space-y-5 top-1/2 -translate-y-1/2 left-[5%] border border-gray-100/50 max-w-[280px]"
      >
        <div className="flex gap-4 items-start">
          <div className="bg-blue-50 rounded-xl p-3 flex-shrink-0">
            <Compass className="text-blue-600" size={22} />
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-gray-800 text-sm">
              Smart Discovery
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Find unique destinations
            </p>
          </div>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex gap-4 items-start">
          <div className="bg-purple-50 rounded-xl p-3 flex-shrink-0">
            <Sparkles className="text-purple-600" size={22} />
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-gray-800 text-sm">
              AI Trip Planner
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Get optimized itineraries
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right floating card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="hidden lg:block max-w-[240px] absolute bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-gray-200/40 top-1/2 -translate-y-1/2 right-[5%] border border-gray-100/50"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4">
            <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h2 className="font-semibold text-gray-800 text-sm">
              Continuous Guidance
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Tourtoise guides you throughout your tour and re-adjusts your plan
            </p>
          </div>
        </div>
      </motion.div>
    </Container>
  );
}
