import React from "react";
import Card from "@/components/ui/card";
import { Check } from "lucide-react";

const DestinationOverview = ({ destination }) => {
  const tips = destination.cultural_tips || [];
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <h3 className="font-bold text-slate-900">
          Why {destination.name} is a great choice
        </h3>
        <div className="mt-4 text-slate-600">
          {tips?.length ? (
            <ul className="list-disc space-y-2">
              {tips.map((tip) => (
                <li key={tip} className="flx gap-2">
                  <Check size={16} className="text-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          ) : (
            <p>No cultural tips available.</p>
          )}
        </div>
      </Card>
      <Card>
        <h3 className="font-bold text-slate-900">
          What {destination.name} feels like
        </h3>
        <p className="mt-4 leading-7 text-slate-600">
          {destination.overview || "No overview available yet."}
        </p>
      </Card>
    </div>
  );
};

export default DestinationOverview;
