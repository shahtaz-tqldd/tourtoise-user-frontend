"use client";

import React from "react";
import { MessageCircle, Compass } from "lucide-react";
import { motion } from "framer-motion";
import Container from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

const TourAgent: React.FC = () => {
  // Animation variants for the section
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
      },
    },
  };

  return (
    <Container className="py-16 md:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        className="text-center max-w-3xl mx-auto"
      >
        {/* Persuasive Title */}
        <Typography
          as="h2"
          size="xxl"
          className="!font-bold leading-tight"
        >
          Can&apos;t Decide Where to Go for Your Next Tour?
        </Typography>

        {/* Supporting Text to Convert User */}
        <Typography
          as="p"
          size="base"
          className="mt-4 leading-relaxed"
        >
          Let our AI agent handle the planning. Tell us your preferences, and
          we&apos;ll craft a personalized itinerary just for you, saving you time and
          hassle.
        </Typography>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16">
          {/* Primary CTA: Ask Agent */}
          <Button size="lg" className="w-full sm:w-auto">
            <MessageCircle size={16} />
            Ask Agent
          </Button>

          {/* Secondary CTA: Keep Exploring */}
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <Compass size={16} />
            Keep Exploring
          </Button>
        </div>
      </motion.div>
    </Container>
  );
};

export default TourAgent;
