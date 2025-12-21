"use client";

import React, { useState } from "react";
import SearchFilters from "./search-filter";
import DestinationList from "./destination-list";
import { useDestinationListQuery } from "@/store/services/destination";

const DestinationPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const { data } = useDestinationListQuery({ page, page_size: pageSize });
  return (
    <>
      <SearchFilters />
      <DestinationList data={data?.data || []} />
    </>
  );
};

export default DestinationPage;
