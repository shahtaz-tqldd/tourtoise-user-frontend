import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Backpack,
  Loader2,
  PencilLine,
  Plus,
  RefreshCw,
  Shirt,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import PreviewContent from "@/components/shared/preview-content";
import { DeleteDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import { PreviewCard } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  useCreateTripPackingItemMutation,
  useDeleteTripPackingItemMutation,
  useTripPackingItemListQuery,
  useUpdateTripPackingItemMutation,
} from "@/features/trips/tripApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

const categoryOptions = [
  { value: "clothing", label: "Clothing" },
  { value: "toiletries", label: "Toiletries" },
  { value: "electronics", label: "Electronics" },
  { value: "medicine", label: "Medicine" },
  { value: "travel_gear", label: "Travel Gear" },
  { value: "safety", label: "Safety" },
  { value: "weather", label: "Weather" },
  { value: "other", label: "Other" },
];

const priorityOptions = [
  { value: "essential", label: "Essential" },
  { value: "recommended", label: "Recommended" },
  { value: "optional", label: "Optional" },
];

const priorityStyles = {
  essential: "text-red-700 bg-red-100",
  recommended: "text-primary bg-primary/10",
  optional: "text-orange-500 bg-orange-100",
};

const formatLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const bySortOrder = (items = []) =>
  [...items].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

const unwrapPackingItems = (response) => {
  const data = response?.data || response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const getResponseItem = (response) => {
  const data = response?.data || response;

  if (Array.isArray(data)) return null;
  return data?.id ? data : null;
};

const applySortOrder = (items) =>
  items.map((item, index) => ({ ...item, sort_order: index + 1 }));

const buildPackingPayload = ({
  item,
  quantity,
  category,
  priority,
  additional_notes,
  is_packed,
}) => ({
  item: String(item || "").trim(),
  quantity: Math.max(1, Number(quantity || 1)),
  category: category || "other",
  priority: priority || "recommended",
  additional_notes: String(additional_notes || "").trim(),
  ...(typeof is_packed === "boolean" ? { is_packed } : {}),
});

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

const TripPackingItems = ({ tripId }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [localItems, setLocalItems] = useState(null);
  const { data, isFetching, isError, refetch } = useTripPackingItemListQuery(
    { trip_id: tripId, page_size: 100 },
    { skip: !tripId },
  );
  const [createTripPackingItem, { isLoading: isCreating }] =
    useCreateTripPackingItemMutation();
  const [updateTripPackingItem, { isLoading: isUpdating }] =
    useUpdateTripPackingItemMutation();
  const [deleteTripPackingItem, { isLoading: isDeleting }] =
    useDeleteTripPackingItemMutation();
  const packingItems = useMemo(
    () => bySortOrder(unwrapPackingItems(data)),
    [data],
  );
  const visibleItems = localItems || packingItems;
  const isMutating = isCreating || isUpdating || isDeleting;

  const updateLocalItem = (packingItemId, patch) => {
    setLocalItems((currentItems) =>
      (currentItems || visibleItems).map((currentItem) =>
        currentItem.id === packingItemId
          ? { ...currentItem, ...patch }
          : currentItem,
      ),
    );
  };

  const handleCreateItem = async (payload) => {
    try {
      const response = await createTripPackingItem({
        trip_id: tripId,
        payload,
      }).unwrap();
      const createdItem = getResponseItem(response);
      if (createdItem) {
        setLocalItems((currentItems) =>
          applySortOrder([...(currentItems || visibleItems), createdItem]),
        );
      }
      toast.success(response?.message || "Packing item created.");
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create packing item."));
      return false;
    }
  };

  const handleUpdateItem = async (packingItemId, payload) => {
    const previousItems = visibleItems;
    updateLocalItem(packingItemId, payload);
    setEditingItem(null);

    try {
      const response = await updateTripPackingItem({
        trip_id: tripId,
        packing_item_id: packingItemId,
        payload,
      }).unwrap();
      const responseItem = getResponseItem(response);
      if (responseItem) updateLocalItem(responseItem.id, responseItem);
      toast.success(response?.message || "Packing item updated.");
    } catch (error) {
      setLocalItems(previousItems);
      setEditingItem(previousItems.find((item) => item.id === packingItemId));
      toast.error(getApiErrorMessage(error, "Could not update packing item."));
    }
  };

  const handleTogglePacked = async (packingItem, checked) => {
    const isPacked = checked === true;
    const previousItems = visibleItems;

    updateLocalItem(packingItem.id, { is_packed: isPacked });

    try {
      await updateTripPackingItem({
        trip_id: tripId,
        packing_item_id: packingItem.id,
        payload: { is_packed: isPacked },
      }).unwrap();
    } catch (error) {
      setLocalItems(previousItems);
      toast.error(getApiErrorMessage(error, "Could not update packed status."));
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;

    const previousItems = visibleItems;
    const nextItems = applySortOrder(
      previousItems.filter((item) => item.id !== deletingItem.id),
    );

    setLocalItems(nextItems);
    setDeletingItem(null);
    if (editingItem?.id === deletingItem.id) setEditingItem(null);

    try {
      const response = await deleteTripPackingItem({
        trip_id: tripId,
        packing_item_id: deletingItem.id,
      }).unwrap();
      toast.success(response?.message || "Packing item deleted.");
    } catch (error) {
      setLocalItems(previousItems);
      setDeletingItem(deletingItem);
      toast.error(getApiErrorMessage(error, "Could not delete packing item."));
    }
  };

  return (
    <>
      <PreviewCard className="space-y-5 md:rounded-t-none">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            icon={Backpack}
            title="Packing"
            description="Track essentials before the trip is locked."
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
            Loading packing items...
          </div>
        ) : null}

        {!isFetching && isError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Could not load packing items.
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
          <div className="grid gap-2">
            {visibleItems.length ? (
              visibleItems.map((packingItem) => (
                <PackingItemCard
                  key={`${packingItem.id}-${
                    editingItem?.id === packingItem.id ? "edit" : "view"
                  }`}
                  item={packingItem}
                  isEditing={editingItem?.id === packingItem.id}
                  isUpdating={isUpdating}
                  isDisabled={isMutating && editingItem?.id !== packingItem.id}
                  onTogglePacked={(checked) =>
                    handleTogglePacked(packingItem, checked)
                  }
                  onEdit={() => setEditingItem(packingItem)}
                  onCancelEdit={() => setEditingItem(null)}
                  onSave={(payload) =>
                    handleUpdateItem(packingItem.id, payload)
                  }
                  onDelete={() => setDeletingItem(packingItem)}
                />
              ))
            ) : (
              <EmptyState
                title="Empty Packing items"
                description="You have no packing items added in this trip yet!"
              />
            )}
          </div>
        ) : null}
      </PreviewCard>

      <PackingItemCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isLoading={isCreating}
        onSubmit={handleCreateItem}
      />
      <DeleteDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
        title="Delete this packing item"
        description="Deleting this packing item will remove it from this trip. This action can't be undone."
        onConfirm={handleDeleteItem}
        isLoading={isDeleting}
      />
    </>
  );
};

const PackingItemCard = ({
  item,
  isEditing,
  isUpdating,
  isDisabled,
  onTogglePacked,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}) => {
  const itemRef = useRef(null);
  const [itemName, setItemName] = useState(item.item || "");
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [category, setCategory] = useState(item.category || "other");
  const [priority, setPriority] = useState(item.priority || "recommended");
  const [notes, setNotes] = useState(item.additional_notes || "");

  useEffect(() => {
    if (!isEditing) return;

    requestAnimationFrame(() => itemRef.current?.focus());
  }, [isEditing]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = buildPackingPayload({
      item: itemName,
      quantity,
      category,
      priority,
      additional_notes: notes,
      is_packed: item.is_packed,
    });

    if (!payload.item) {
      toast.error("Add packing item name.");
      return;
    }

    await onSave(payload);
  };

  const cardClass =
    "rounded-xl bg-white md:bg-slate-50 border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700";

  if (isEditing) {
    return (
      <form className={cardClass} onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <Checkbox checked={Boolean(item.is_packed)} disabled />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <input
                  ref={itemRef}
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  disabled={isUpdating}
                  className="w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none disabled:opacity-60"
                  required
                />
                <input
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={isUpdating}
                  className="mt-2 block w-full border-none bg-transparent p-0 text-sm font-normal leading-5 text-slate-500 outline-none disabled:opacity-60"
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <div className="mt-4 flbx">
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  disabled={isUpdating}
                  className="h-8 w-16 rounded-full border border-slate-200 bg-white px-2 text-center text-xs font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  aria-label="Quantity"
                />
                <InlinePillSelect
                  value={category}
                  onValueChange={setCategory}
                  disabled={isUpdating}
                  options={categoryOptions}
                  className="border-slate-200 bg-white text-slate-500"
                />
                <InlinePillSelect
                  value={priority}
                  onValueChange={setPriority}
                  disabled={isUpdating}
                  options={priorityOptions}
                  className={
                    priorityStyles[priority] ||
                    "border-slate-200 bg-white text-slate-500"
                  }
                />
              </div>
              <div className="flx gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={onCancelEdit}
                  className="!text-xs rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdating}
                  className="!text-xs rounded-full"
                >
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <article className={cardClass}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={Boolean(item.is_packed)}
          disabled={isDisabled}
          onCheckedChange={onTogglePacked}
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex gap-2">
                <p
                  className={`font-semibold ${
                    item.is_packed
                      ? "text-slate-400 line-through"
                      : "text-slate-900"
                  }`}
                >
                  {item.item}
                </p>
                {item.quantity > 1 ? (
                  <span className="size-5 rounded-full text-xs font-semibold bg-primary/10 text-primary center">
                    {item.quantity}
                  </span>
                ) : null}
              </div>
              {item.additional_notes ? (
                <p className="mt-2 text-sm font-normal leading-5 text-slate-500">
                  {item.additional_notes}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flbx mt-3 md:mt-1">
            <div className="flex gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full">
                {formatLabel(item.category)}
              </span>
              <span
                className={`text-xs py-0.5 px-2 rounded-full ${
                  priorityStyles[item.priority] || "text-slate-500"
                }`}
              >
                {formatLabel(item.priority)}
              </span>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Update packing item"
                className="text-blue-950/50 hover:bg-blue-50 hover:text-blue-800"
                disabled={isDisabled}
                onClick={onEdit}
              >
                <PencilLine size={12} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Delete packing item"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={isDisabled}
                onClick={onDelete}
              >
                <Trash2 size={12} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

const PackingItemCreateDialog = ({
  open,
  onOpenChange,
  isLoading,
  onSubmit,
}) => {
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState("recommended");

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setCategory("other");
      setPriority("recommended");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = buildPackingPayload({
      item: formData.get("item"),
      quantity: formData.get("quantity"),
      category,
      priority,
      additional_notes: formData.get("additional_notes"),
      is_packed: false,
    });

    if (!payload.item) {
      toast.error("Add packing item name.");
      return;
    }

    const didCreate = await onSubmit(payload);
    if (didCreate) handleOpenChange(false);
  };

  return (
    <PreviewContent
      open={open}
      onOpenChange={handleOpenChange}
      className="md:p-8 p-6 !max-w-xl h-fit"
    >
      <h2 className="text-lg font-bold mt-2 md:mt-0">Create packing item</h2>
      <p className="text-sm mt-1 text-slate-500">
        Add an item to prepare before the trip.
      </p>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <FloatingInput name="item" label="Item" disabled={isLoading} required />
        <FloatingInput
          name="quantity"
          label="Quantity"
          type="number"
          min="1"
          defaultValue="1"
          disabled={isLoading}
          required
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingSelect
            label="Category"
            placeholder="Select category"
            value={category}
            onValueChange={setCategory}
            disabled={isLoading}
          >
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </FloatingSelect>
          <FloatingSelect
            label="Priority"
            placeholder="Select priority"
            value={priority}
            onValueChange={setPriority}
            disabled={isLoading}
          >
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </FloatingSelect>
        </div>
        <FloatingTextarea
          name="additional_notes"
          label="Additional notes"
          disabled={isLoading}
          rows={4}
          textareaClassName="min-h-32 leading-7"
        />
        <div className="mt-8 flex md:flex-row flex-col w-full md:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => handleOpenChange(false)}
            className="w-full md:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Saving..." : "Create item"}
          </Button>
        </div>
      </form>
    </PreviewContent>
  );
};

export default TripPackingItems;
