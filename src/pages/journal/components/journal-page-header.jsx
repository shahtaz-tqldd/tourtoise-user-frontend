import ListingHeader from "@/components/shared/listing-header";
import { UserAvatar } from "@/components/shared/user-profile";
import { Plus } from "lucide-react";

const JournalPageHeader = ({ onCreate }) => (
  <ListingHeader
    title="Travel Journal"
    filters={
      <div className="flex w-full md:justify-end">
        <CreateJournalTrigger onCreate={onCreate} />
      </div>
    }
  />
);

const CreateJournalTrigger = ({ onCreate }) => (
  <button
    type="button"
    className="max-w-100 flex w-full cursor-pointer gap-2"
    onClick={onCreate}
  >
    <UserAvatar className="size-10" />
    <div className="flex w-full flex-1 items-center gap-2 rounded-full border bg-white px-4 py-3 text-slate-400">
      <Plus size={15} />
      <span className="text-sm">Write Your Travel Journal</span>
    </div>
  </button>
);
export default JournalPageHeader;
