import React from "react";
import SearchFilters from "./search-filter";
import DestinationList from "./destination-list";
import { DESTINATIONS } from "./_demo-data";

const DestinationPage = () => {
  return (
    <>
      <SearchFilters />
      <DestinationList data={DESTINATIONS} />
    </>
  );
};

export default DestinationPage;
