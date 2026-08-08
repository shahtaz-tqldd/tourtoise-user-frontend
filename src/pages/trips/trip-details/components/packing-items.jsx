import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Backpack,
  MoreVertical,
  PencilLine,
  Plus,
  RefreshCw,
  Shirt,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import PreviewContent from "@/components/shared/preview-content";
import PreviewActionsDropdown from "@/components/shared/preview-actions-dropdown";
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

const byPackedStateAndSortOrder = (items = []) =>
  [...items].sort((a, b) => {
    const packedDifference =
      Number(Boolean(a.is_packed)) - Number(Boolean(b.is_packed));

    if (packedDifference) return packedDifference;

    return (a.sort_order || 0) - (b.sort_order || 0);
  });

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

const PackingListSkeleton = () => (
  <div className="space-y-4" aria-label="Loading packing items">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="mt-1 size-5 animate-pulse rounded bg-slate-100" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-4 w-36 animate-pulse rounded-full bg-slate-200" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
                <div className="h-5 w-24 animate-pulse rounded-full bg-primary/10" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
          <div className="size-8 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

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

const TripPackingItems = ({ tripId, onStatsChange }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [localItems, setLocalItems] = useState(null);
  const itemElementsRef = useRef(new Map());
  const previousPositionsRef = useRef(new Map());
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
    () => byPackedStateAndSortOrder(unwrapPackingItems(data)),
    [data],
  );
  const visibleItems = useMemo(
    () => byPackedStateAndSortOrder(localItems || packingItems),
    [localItems, packingItems],
  );
  const isMutating = isCreating || isUpdating || isDeleting;

  useLayoutEffect(() => {
    const currentPositions = new Map();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    itemElementsRef.current.forEach((element, itemId) => {
      const currentPosition = element.getBoundingClientRect();
      currentPositions.set(itemId, currentPosition);

      const previousPosition = previousPositionsRef.current.get(itemId);
      const offsetY = previousPosition?.top - currentPosition.top;

      if (!reduceMotion && offsetY && typeof element.animate === "function") {
        element.animate(
          [
            { transform: `translate3d(0, ${offsetY}px, 0)` },
            { transform: "translate3d(0, 0, 0)" },
          ],
          {
            duration: 420,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
        );
      }
    });

    previousPositionsRef.current = currentPositions;
  }, [visibleItems]);

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
        onStatsChange?.({
          totalDelta: 1,
          packedDelta: createdItem.is_packed ? 1 : 0,
        });
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
    if (Boolean(packingItem.is_packed) !== isPacked) {
      onStatsChange?.({ packedDelta: isPacked ? 1 : -1 });
    }

    try {
      await updateTripPackingItem({
        trip_id: tripId,
        packing_item_id: packingItem.id,
        payload: { is_packed: isPacked },
      }).unwrap();
    } catch (error) {
      setLocalItems(previousItems);
      if (Boolean(packingItem.is_packed) !== isPacked) {
        onStatsChange?.({ packedDelta: isPacked ? -1 : 1 });
      }
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
    onStatsChange?.({
      totalDelta: -1,
      packedDelta: deletingItem.is_packed ? -1 : 0,
    });

    try {
      const response = await deleteTripPackingItem({
        trip_id: tripId,
        packing_item_id: deletingItem.id,
      }).unwrap();
      toast.success(response?.message || "Packing item deleted.");
    } catch (error) {
      setLocalItems(previousItems);
      setDeletingItem(deletingItem);
      onStatsChange?.({
        totalDelta: 1,
        packedDelta: deletingItem.is_packed ? 1 : 0,
      });
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

        {isFetching ? <PackingListSkeleton /> : null}

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
          <div className="space-y-4">
            {visibleItems.length ? (
              visibleItems.map((packingItem) => (
                <div
                  key={packingItem.id}
                  ref={(element) => {
                    if (element) {
                      itemElementsRef.current.set(packingItem.id, element);
                    } else {
                      itemElementsRef.current.delete(packingItem.id);
                    }
                  }}
                  className="will-change-transform"
                >
                  <PackingItemCard
                    key={
                      editingItem?.id === packingItem.id ? "edit" : "view"
                    }
                    item={packingItem}
                    isEditing={editingItem?.id === packingItem.id}
                    isUpdating={isUpdating}
                    isDisabled={
                      isMutating && editingItem?.id !== packingItem.id
                    }
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
                </div>
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
    <article
      className={`rounded-xl border p-4 transition-[background-color,border-color] duration-300 ${
        item.is_packed
          ? "border-slate-100 bg-slate-50/80"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={Boolean(item.is_packed)}
          disabled={isDisabled}
          onCheckedChange={onTogglePacked}
          className="mt-[2px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 w-full">
              <div className="flex justify-between gap-4">
                <div className="flex gap-2">
                  <h2
                    className={`font-semibold text-sm ${
                      item.is_packed
                        ? "text-slate-400 line-through"
                        : "text-slate-900"
                    }`}
                  >
                    {item.item}
                  </h2>
                  {item.quantity > 1 ? (
                    <span className="size-5 rounded-full text-xs font-semibold bg-primary/10 text-primary center">
                      {item.quantity}
                    </span>
                  ) : null}
                </div>
                <PreviewActionsDropdown
                  title="Packing item actions"
                  description="Choose an action for this packing item."
                  contentClassName="w-36"
                  trigger={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Packing item actions"
                      className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 -mt-2 -mr-2"
                      disabled={isDisabled}
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
              {item.additional_notes ? (
                <p className="mt-1 text-sm font-normal leading-5 text-slate-500">
                  {item.additional_notes}
                </p>
              ) : null}
            </div>
          </div>
          {!item?.is_packed ? (
            <div className="flex gap-2 mt-2.5">
              <span className="text-xs font-semibold bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full">
                {formatLabel(item.category)}
              </span>
              <span
                className={`text-xs py-0.5 px-2 rounded-full font-semibold ${
                  priorityStyles[item.priority] || "text-slate-500"
                }`}
              >
                {formatLabel(item.priority)}
              </span>
            </div>
          ) : null}
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
