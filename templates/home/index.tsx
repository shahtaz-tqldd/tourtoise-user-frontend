import React from "react";
import Hero from "./hero";
import SuggestedDestination from "./suggested-destination";
import TourAgent from "./tour-agent/tour-agent";

const Homepage = () => {
  return (
    <>
      <Hero />
      <SuggestedDestination />
      <TourAgent />
    </>
  );
};

export default Homepage;
