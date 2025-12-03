import Container from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import React from "react";
import Hero from "./hero";
import SuggestedDestination from "./suggested-destination";

const Homepage = () => {
  return (
    <div
      style={{
        backgroundImage: 'url("/bg.jpg")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
      className="pt-20"
    >
      <Hero />
      <SuggestedDestination />
    </div>
  );
};

export default Homepage;
