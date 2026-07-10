import React from "react";
import Card from "@/components/ui/card";
import { Check } from "lucide-react";

const DestinationOverview = ({ destination }) => {
  const picking_reasons = destination.picking_reasons || [];
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <h3 className="font-bold text-slate-900">
          Why {destination.name} is a great choice
        </h3>
        <div className="mt-4 text-slate-600">
          {picking_reasons?.length ? (
            <ul className="list-disc space-y-2">
              {picking_reasons.map((tip) => (
                <li key={tip} className="flx gap-2">
                  <Check size={16} className="text-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          ) : (
            <p className="opacity-75">
              Currently no distinguishing reasons were provided!
            </p>
          )}
        </div>
      </Card>
      <Card>
        <h3 className="font-bold text-slate-900">
          What {destination.name} feels like
        </h3>
        <p className="mt-4 leading-7 text-slate-600">
          {destination.description || (
            <span className="opacity-75">
              No description available for this destination.
            </span>
          )}
        </p>
      </Card>
    </div>
  );
};

export default DestinationOverview;
