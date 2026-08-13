import { useSearchParams } from "react-router-dom";

// components
import TabMenu from "@/components/ui/tab";
import SavedDestinations from "./components/saved-destinations";
import SavedJournal from "./components/saved-journals";

// icons
import { MapPin, Newspaper } from "lucide-react";
import useTitle from "@/hooks/useTitle";
import { Container } from "@/components/ui/container";
import ListingHeader from "@/components/shared/listing-header";

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
    <Container>
      <ListingHeader title="  Saved Items" />

      <TabMenu
        tabs={SAVED_ITEMS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollable
        className="bg-transparent"
      />
      {activeTab === "destinations" ? <SavedDestinations /> : <SavedJournal />}
    </Container>
  );
};

export default SavedItemsPage;
