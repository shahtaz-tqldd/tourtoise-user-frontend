import React from "react";
import { cn } from "@/lib/utils";

const TabMenu = ({ tabs, activeTab, setActiveTab, className }) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-slate-200",
        className,
      )}
    >
      {tabs.map((tab) => (
        <TabButton
          key={tab.value}
          tab={tab}
          active={activeTab === tab.value}
          onClick={() => setActiveTab(tab.value)}
        />
      ))}
    </div>
  );
};

const TabButton = ({ tab, active, onClick }) => {
  const Icon = tab.icon;
  const hasCount = tab.count !== undefined && tab.count !== null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 py-3 text-sm font-semibold transition flx gap-2 ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-slate-500 hover:text-slate-900"
      } ${hasCount ? "pl-3.5 pr-2.5" : "px-3.5"}`}
    >
      {Icon && <Icon size={15} />}
      {tab.label}
      {hasCount && (
        <span
          className={cn(
            "h-5 min-w-5 px-1 text-xs font-semibold center rounded-full bg-slate-100",
          )}
        >
          {tab.count}
        </span>
      )}
    </button>
  );
};

export default TabMenu;
