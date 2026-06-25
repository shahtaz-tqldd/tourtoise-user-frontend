import React from "react";
import Card from "@/components/ui/card";

const TripEssentials = ({ destination }) => {
  const getting_around =
    destination.getting_around || "No transport notes available.";
  const visa_notes = destination.visa_notes || "N/A";

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <h3 className="font-bold text-slate-900">
          Getting Around {destination.name}
        </h3>
        <div className="mt-4 leading-7 text-slate-600">{getting_around}</div>
      </Card>
      <Card>
        <h3 className="font-bold text-slate-900">
          Visa notes for {destination.name}
        </h3>
        <p className="mt-4 leading-7 text-slate-600">{visa_notes}</p>
      </Card>
    </div>
  );
};

export default TripEssentials;
