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
    <section className="min-w-0 space-y-5 pt-5 pb-20 sm:space-y-6 md:pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-950 md:text-2xl">
          Saved Items
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your saved destinations and journal posts are listed here
        </p>
      </div>
      <TabMenu
        tabs={SAVED_ITEMS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollable
        className="bg-transparent"
      />
      <div role="tabpanel" aria-label={`Saved ${activeTab}`}>
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
