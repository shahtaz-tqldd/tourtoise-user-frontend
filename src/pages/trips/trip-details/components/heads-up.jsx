import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  GripVertical,
  Loader2,
  PencilLine,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import DraggableList from "@/components/shared/draggable-list";
import PreviewContent from "@/components/shared/preview-content";
import { EmptyState, SectionHeader } from "@/components/shared/utils";
import { DeleteDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { PreviewCard } from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/input";
import {
  FloatingSelect,
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

const InlinePillSelect = ({
  value,
  onValueChange,
  options,
  disabled,
  className = "",
}) => (
  <Select value={value} onValueChange={onValueChange} disabled={disabled}>
    <SelectTrigger
      className={`!h-auto min-h-0 w-fit gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-none focus-visible:ring-2 [&_svg]:size-3 ${className}`}
    >
      <SelectValue />
    </SelectTrigger>
    <SelectContent align="start">
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
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

        {isFetching ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-500">
            <Loader2 className="animate-spin text-primary" size={16} />
            Loading heads-up info...
          </div>
        ) : null}

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
          onChange={(event) => setDetails(event.target.value)}
          disabled={isUpdating}
          required
          rows={3}
          className="mt-2 block min-h-20 w-full resize-y border-none bg-transparent pl-8 text-sm leading-6 text-slate-500 outline-none placeholder:text-slate-400 disabled:opacity-60"
        />
      </form>
    );
  }

  return (
    <article
      className={`rounded-xl border border-slate-200 bg-slate-50 p-4 transition ${
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
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Update heads-up"
            className="text-blue-950/50 hover:bg-blue-50 hover:text-blue-800"
            disabled={isDragDisabled}
            onClick={onEdit}
          >
            <PencilLine size={12} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Delete heads-up"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={isDragDisabled}
            onClick={onDelete}
          >
            <Trash2 size={12} />
          </Button>
        </div>
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
