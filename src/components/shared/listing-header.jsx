import { PageHeader } from "@/components/ui/section";

/** Page title + optional filter bar. Thin wrapper over <PageHeader>. */
const ListingHeader = ({ id, level, title, description, eyebrow, filters = null, className = "" }) => (
  <PageHeader
    id={id}
    level={level}
    eyebrow={eyebrow}
    title={title}
    description={description}
    actions={filters}
    className={className}
  />
);

export default ListingHeader;
