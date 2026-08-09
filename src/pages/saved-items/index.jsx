import { useSearchParams } from "react-router-dom";

// components
import TabMenu from "@/components/ui/tab";
import SavedDestinations from "./components/saved-destinations";
import SavedJournal from "./components/saved-journals";

// icons
import { MapPin, Newspaper } from "lucide-react";
import useTitle from "@/hooks/useTitle";

const SAVED_ITEMS = [
  { value: "destinations", label: "Destinations", icon: MapPin },
  { value: "journals", label: "Journals", icon: Newspaper },
];
const SAVED_ITEM_TABS = new Set(SAVED_ITEMS.map(({ value }) => value));

const SavedItemsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = SAVED_ITEM_TABS.has(requestedTab)
    ? requestedTab
    : "destinations";
  useTitle("tourtoise - saved items");

  const setActiveTab = (tab) => {
    if (!SAVED_ITEM_TABS.has(tab) || tab === activeTab) return;

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.set("tab", tab);
      return nextParams;
    });
  };

  return (
    <section className="flex min-h-[calc(100svh-4.5rem)] min-w-0 flex-col gap-5 pt-5 pb-20 sm:gap-6 md:pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-950 md:text-2xl">
          Saved Items
        </h1>
      </div>
      <TabMenu
        tabs={SAVED_ITEMS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollable
        className="bg-transparent"
      />
      <div
        className="flex min-h-0 flex-1 flex-col"
        role="tabpanel"
        aria-label={`Saved ${activeTab}`}
      >
        {activeTab === "destinations" ? (
          <SavedDestinations />
        ) : (
          <SavedJournal />
        )}
      </div>
    </section>
  );
};

export default SavedItemsPage;
