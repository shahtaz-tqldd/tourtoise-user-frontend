import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  GripVertical,
  MoreVertical,
  PencilLine,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import DraggableList from "@/components/shared/draggable-list";
import PreviewContent from "@/components/shared/preview-content";
import PreviewActionsDropdown from "@/components/shared/preview-actions-dropdown";
import { EmptyState, SectionHeader } from "@/components/shared/utils";
import { DeleteDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { PreviewCard } from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/input";
import {
  FloatingSelect,
  InlinePillSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloatingTextarea } from "@/components/ui/textarea";
import {
  useCreateTripHeadsUpMutation,
  useDeleteTripHeadsUpMutation,
  useTripHeadsUpListQuery,
  useUpdateTripHeadsUpMutation,
} from "@/features/trips/tripApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { moveItem } from "@/lib/reorder";

const categoryOptions = [
  { value: "safety", label: "Safety" },
  { value: "weather", label: "Weather" },
  { value: "transport", label: "Transport" },
  { value: "health", label: "Health" },
  { value: "document", label: "Document" },
  { value: "general", label: "General" },
];

const severityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const severityStyles = {
  high: "border-red-100 bg-red-50 text-red-700",
  medium: "border-amber-100 bg-amber-50 text-amber-700",
  low: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

const bySortOrder = (items = []) =>
  [...items].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

const getHeadsUpDetails = (item) =>
  item?.additional_note || item?.details || item?.body || item?.content || "";

const getHeadsUpCategory = (item) => item?.category || item?.type || "general";

const getHeadsUpSeverity = (item) => item?.severity || "medium";

const buildHeadsUpPayload = ({ title, details, category, severity }) => ({
  title: String(title || "").trim(),
  additional_note: String(details || "").trim(),
  category: category || "general",
  severity: severity || "medium",
});

const applySortOrder = (items) =>
  items.map((item, index) => ({
    ...item,
    sort_order: index + 1,
  }));

const getChangedOrders = (previousItems, nextItems) =>
  nextItems
    .filter((item) => {
      const previousItem = previousItems.find(
        (current) => current.id === item.id,
      );
      const nextSortOrder =
        nextItems.findIndex((current) => current.id === item.id) + 1;

      return previousItem && previousItem.sort_order !== nextSortOrder;
    })
    .map((item) => ({
      id: item.id,
      sort_order: nextItems.findIndex((current) => current.id === item.id) + 1,
    }));

const getResponseItem = (response) => {
  const data = response?.data || response;

  if (Array.isArray(data)) return null;
  return data?.id ? data : null;
};

const HeadsUpListSkeleton = () => (
  <div className="space-y-3" aria-label="Loading heads-up info">
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 h-5 w-4 animate-pulse rounded bg-slate-100" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-primary/10" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="size-8 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

const TripHeadsUp = ({ tripId }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHeadsUp, setEditingHeadsUp] = useState(null);
  const [deletingHeadsUp, setDeletingHeadsUp] = useState(null);
  const [previousHeadsUpList, setPreviousHeadsUpList] = useState(null);
  const [localHeadsUpList, setLocalHeadsUpList] = useState(null);
  const { data, isFetching, isError, refetch } = useTripHeadsUpListQuery(
    { trip_id: tripId, page_size: 100 },
    { skip: !tripId },
  );
  const [updateTripHeadsUp, { isLoading: isUpdating }] =
    useUpdateTripHeadsUpMutation();
  const [deleteTripHeadsUp, { isLoading: isDeleting }] =
    useDeleteTripHeadsUpMutation();
  const headsUpList = useMemo(() => bySortOrder(data?.data), [data]);
  const visibleHeadsUpList = localHeadsUpList || headsUpList;
  const isMutating = isUpdating || isDeleting;

  const handleUpdateHeadsUp = async (payload) => {
    if (!editingHeadsUp) return;

    const previousItems = visibleHeadsUpList;
    const nextItems = previousItems.map((item) =>
      item.id === editingHeadsUp.id ? { ...item, ...payload } : item,
    );

    setLocalHeadsUpList(nextItems);
    setEditingHeadsUp(null);

    try {
      const response = await updateTripHeadsUp({
        trip_id: tripId,
        headsup_id: editingHeadsUp.id,
        payload,
      }).unwrap();
      const responseItem = getResponseItem(response);
      if (responseItem) {
        setLocalHeadsUpList((currentItems) =>
          (currentItems || nextItems).map((item) =>
            item.id === responseItem.id ? responseItem : item,
          ),
        );
      }
      toast.success(response?.message || "Heads-up updated.");
    } catch (error) {
      setLocalHeadsUpList(previousItems);
      setEditingHeadsUp(editingHeadsUp);
      toast.error(getApiErrorMessage(error, "Could not update heads-up info."));
    }
  };

  const handleDeleteHeadsUp = async () => {
    if (!deletingHeadsUp) return;

    const previousItems = visibleHeadsUpList;
    const nextItems = applySortOrder(
      previousItems.filter((item) => item.id !== deletingHeadsUp.id),
    );

    setLocalHeadsUpList(nextItems);
    setDeletingHeadsUp(null);
    if (editingHeadsUp?.id === deletingHeadsUp.id) {
      setEditingHeadsUp(null);
    }

    try {
      const response = await deleteTripHeadsUp({
        trip_id: tripId,
        headsup_id: deletingHeadsUp.id,
      }).unwrap();
      toast.success(response?.message || "Heads-up deleted.");
    } catch (error) {
      setLocalHeadsUpList(previousItems);
      setDeletingHeadsUp(deletingHeadsUp);
      toast.error(getApiErrorMessage(error, "Could not delete heads-up info."));
    }
  };

  const handleMoveHeadsUp = (fromIndex, toIndex) => {
    if (isMutating) return;

    setPreviousHeadsUpList(
      (currentItems) => currentItems || visibleHeadsUpList,
    );

    setLocalHeadsUpList((currentItems) => {
      const sourceItems = currentItems || visibleHeadsUpList;
      return applySortOrder(moveItem(sourceItems, fromIndex, toIndex));
    });
  };

  const handleDropHeadsUp = async (activeHeadsUpId) => {
    if (!previousHeadsUpList || isMutating) {
      return;
    }

    const nextItems = localHeadsUpList || visibleHeadsUpList;
    const changedOrders = getChangedOrders(previousHeadsUpList, nextItems);

    if (!changedOrders.length) {
      setPreviousHeadsUpList(null);
      return;
    }

    try {
      const response = await updateTripHeadsUp({
        trip_id: tripId,
        headsup_id: activeHeadsUpId,
        payload: { changed_orders: changedOrders },
      }).unwrap();
      toast.success(response?.message || "Heads-up order updated.");
    } catch (error) {
      setLocalHeadsUpList(previousHeadsUpList);
      toast.error(
        getApiErrorMessage(error, "Could not update heads-up order."),
      );
    } finally {
      setPreviousHeadsUpList(null);
    }
  };

  const handleCreateHeadsUp = (item) => {
    if (!item?.id) return;

    setLocalHeadsUpList((currentItems) =>
      applySortOrder([...(currentItems || visibleHeadsUpList), item]),
    );
  };

  return (
    <>
      <PreviewCard className="space-y-5 md:rounded-t-none">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            icon={AlertTriangle}
            title="Heads-up"
            description="Important information to consider for this trip."
          />
          <Button
            className="!pl-2 !pr-3.5 rounded-full"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            disabled={!tripId}
          >
            <Plus size={14} />
            Add New
          </Button>
        </div>

        {isFetching ? <HeadsUpListSkeleton /> : null}

        {!isFetching && isError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Could not load heads-up info.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 bg-white"
              onClick={refetch}
            >
              <RefreshCw size={14} />
              Retry
            </Button>
          </div>
        ) : null}

        {!isFetching && !isError ? (
          <>
            {visibleHeadsUpList.length ? (
              <DraggableList
                items={visibleHeadsUpList}
                disabled={isMutating || Boolean(editingHeadsUp)}
                onMove={handleMoveHeadsUp}
                onDropEnd={handleDropHeadsUp}
                renderItem={({ item, isDragging, disabled }) => (
                  <HeadsUpCard
                    key={`${item.id}-${editingHeadsUp?.id === item.id ? "edit" : "view"}`}
                    item={item}
                    isEditing={editingHeadsUp?.id === item.id}
                    isUpdating={isUpdating}
                    isDragging={isDragging}
                    isDragDisabled={disabled}
                    onEdit={() => setEditingHeadsUp(item)}
                    onCancelEdit={() => setEditingHeadsUp(null)}
                    onSave={handleUpdateHeadsUp}
                    onDelete={() => setDeletingHeadsUp(item)}
                  />
                )}
              />
            ) : (
              <EmptyState
                title="No Alerts or Notifications"
                description="You have no heads-up info added in this trip yet!"
              />
            )}
          </>
        ) : null}
      </PreviewCard>

      <HeadsUpCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        tripId={tripId}
        onCreated={handleCreateHeadsUp}
      />
      <DeleteDialog
        open={Boolean(deletingHeadsUp)}
        onOpenChange={(open) => {
          if (!open) setDeletingHeadsUp(null);
        }}
        title="Delete this heads-up"
        description="Deleting this heads-up info will remove it from this trip. This action can't be undone."
        onConfirm={handleDeleteHeadsUp}
        isLoading={isDeleting}
      />
    </>
  );
};

const HeadsUpCard = ({
  item,
  isEditing,
  isUpdating,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  isDragging,
  isDragDisabled,
}) => {
  const detailsRef = useRef(null);
  const [title, setTitle] = useState(item.title || "");
  const [details, setDetails] = useState(getHeadsUpDetails(item));
  const [category, setCategory] = useState(getHeadsUpCategory(item));
  const [severity, setSeverity] = useState(getHeadsUpSeverity(item));

  useEffect(() => {
    if (!isEditing) return;

    requestAnimationFrame(() => detailsRef.current?.focus());
  }, [isEditing]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = buildHeadsUpPayload({ title, details, category, severity });

    if (!payload.title || !payload.additional_note) {
      toast.error("Add title and details.");
      return;
    }

    await onSave(payload);
  };
  const handleDetailsChange = (event) => {
    const textarea = event.target;

    setDetails(textarea.value);

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    const textarea = detailsRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [details]);

  if (isEditing) {
    return (
      <form
        className={`rounded-xl border border-slate-200 bg-slate-50 p-4 transition ${
          isDragging ? "border-primary/40 bg-primary/5 opacity-70" : ""
        }`}
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`text-slate-400 ${
                isDragDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-grab hover:bg-white hover:text-slate-600 active:cursor-grabbing"
              }`}
              aria-label="Drag heads-up"
            >
              <GripVertical size={20} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  name={`headsup-title-${item.id}`}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={isUpdating}
                  className="min-w-0 border-none bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
                  required
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <InlinePillSelect
                  value={category}
                  onValueChange={setCategory}
                  disabled={isUpdating}
                  options={categoryOptions}
                  className="border-slate-200 bg-white text-slate-500"
                />
                <InlinePillSelect
                  value={severity}
                  onValueChange={setSeverity}
                  disabled={isUpdating}
                  options={severityOptions}
                  className={
                    severityStyles[severity] ||
                    "border-slate-200 bg-white text-slate-500"
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating}
              size="sm"
              onClick={onCancelEdit}
              className="!text-xs rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              size="sm"
              className="!text-xs rounded-full"
            >
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
        <textarea
          ref={detailsRef}
          name={`headsup-details-${item.id}`}
          value={details}
          onChange={handleDetailsChange}
          disabled={isUpdating}
          required
          rows={1}
          className="mt-2 block w-full resize-none overflow-hidden border-none bg-transparent pl-8 text-sm leading-6 text-slate-500 outline-none placeholder:text-slate-400 disabled:opacity-60"
        />
      </form>
    );
  }

  return (
    <article
      className={`rounded-xl border border-slate-200 p-4 transition ${
        isDragging ? "border-primary/40 bg-primary/5 opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`text-slate-400 ${
              isDragDisabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-grab hover:bg-white hover:text-slate-600 active:cursor-grabbing"
            }`}
            aria-label="Drag heads-up"
          >
            <GripVertical size={20} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {item.title}
              </h3>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {formatLabel(getHeadsUpCategory(item))}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-semibold ${
                  severityStyles[getHeadsUpSeverity(item)] ||
                  "bg-primary/10 text-primary"
                }`}
              >
                {formatLabel(getHeadsUpSeverity(item))}
              </span>
            </div>
          </div>
        </div>
        <PreviewActionsDropdown
          title="Heads-up actions"
          description="Choose an action for this heads-up."
          contentClassName="w-36"
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Heads-up actions"
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 -mt-2 -mr-2"
              disabled={isDragDisabled}
            >
              <MoreVertical size={16} />
            </Button>
          }
          actions={[
            {
              value: "update",
              label: "Update",
              icon: <PencilLine size={15} className="shrink-0" />,
              onSelect: onEdit,
            },
            {
              value: "delete",
              label: "Delete",
              icon: <Trash2 size={15} className="shrink-0" />,
              destructive: true,
              onSelect: onDelete,
            },
          ]}
        />
      </div>
      <p className="pl-8 mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">
        {getHeadsUpDetails(item)}
      </p>
    </article>
  );
};

const HeadsUpCreateDialog = ({ open, onOpenChange, tripId, onCreated }) => {
  const [category, setCategory] = useState("general");
  const [severity, setSeverity] = useState("medium");
  const [createTripHeadsUp, { isLoading: isCreating }] =
    useCreateTripHeadsUpMutation();

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setCategory("general");
      setSeverity("medium");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = buildHeadsUpPayload({
      title: formData.get("title"),
      details: formData.get("details"),
      category,
      severity,
    });

    if (!payload.title || !payload.additional_note) {
      toast.error("Add title and details.");
      return;
    }

    try {
      const response = await createTripHeadsUp({
        trip_id: tripId,
        payload,
      }).unwrap();
      const createdItem = getResponseItem(response);
      if (createdItem) onCreated(createdItem);
      toast.success(response?.message || "Heads-up created.");
      handleOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create heads-up info."));
    }
  };

  return (
    <PreviewContent
      open={open}
      onOpenChange={handleOpenChange}
      className="md:p-8 p-6 !max-w-xl h-fit"
    >
      <h2 className="text-lg font-bold mt-2 md:mt-0">Create heads-up</h2>
      <p className="text-sm mt-1 text-slate-500">
        Add important information travelers should review before the trip.
      </p>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <FloatingInput
          name="title"
          label="Title"
          disabled={isCreating}
          required
        />
        <FloatingTextarea
          name="details"
          label="Details"
          disabled={isCreating}
          rows={3}
          textareaClassName="min-h-40 leading-7"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <FloatingSelect
            label="Category / Type"
            placeholder="Select category"
            value={category}
            onValueChange={setCategory}
            disabled={isCreating}
          >
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </FloatingSelect>
          <FloatingSelect
            label="Severity"
            placeholder="Select severity"
            value={severity}
            onValueChange={setSeverity}
            disabled={isCreating}
          >
            {["low", "medium", "high"].map((option) => (
              <SelectItem key={option} value={option}>
                {formatLabel(option)}
              </SelectItem>
            ))}
          </FloatingSelect>
        </div>
        <div className="mt-8 flex md:flex-row flex-col w-full md:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isCreating}
            onClick={() => handleOpenChange(false)}
            className="w-full md:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating}
            className="w-full md:w-auto"
          >
            {isCreating ? "Saving..." : "Create heads-up"}
          </Button>
        </div>
      </form>
    </PreviewContent>
  );
};

export default TripHeadsUp;
