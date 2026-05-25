import React from "react";

import { Text, Title } from "@/components/ui/typography";
import { TrendingUp } from "lucide-react";

const OverviewStats = ({ stats }) => {
  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-4xl bg-white shadow-sm p-6"
            >
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <Text variant="sm" className="text-gray-500">
                    {item.title}
                  </Text>

                  <Title variant="xl" className="mt-2 text-gray-950">
                    {item.value}
                  </Title>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
              </div>

              <div className="relative mt-5">
                <div>
                  <Text variant="sm" className="font-medium text-gray-700">
                    {item.highlight}
                  </Text>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <Text variant="xs" className="text-gray-500">
                      {item.description}
                    </Text>
                    <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <TrendingUp size={14} />
                      {item.change}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OverviewStats;
