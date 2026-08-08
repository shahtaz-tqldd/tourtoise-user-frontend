import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FileCheck2,
  Loader2,
  MoreVertical,
  Paperclip,
  PencilLine,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
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
  InlinePillSelect,
  SelectItem,
} from "@/components/ui/select";
import { FloatingTextarea } from "@/components/ui/textarea";
import {
  useCreateDocumentItemMutation,
  useDeleteDocumentFileItemMutation,
  useDeleteDocumentItemMutation,
  useTripDocumentListQuery,
  useUpdateTripDocumentItemMutation,
} from "@/features/trips/tripApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn, formatLabel } from "@/lib/utils";

const ACCEPTED_DOCUMENT_TYPES = ".pdf,image/png,image/jpeg,image/webp";

const requiredLevelOptions = [
  { value: "required", label: "Required" },
  { value: "recommended", label: "Recommended" },
  { value: "optional", label: "Optional" },
];

const levelStyles = {
  required: "text-red-700 bg-red-100",
  recommended: "text-primary bg-primary/10",
  optional: "text-orange-500 bg-orange-100",
};

const getResponseItem = (response) => {
  const data = response?.data || response;

  if (Array.isArray(data)) return null;
  return data?.id ? data : null;
};

const getDocumentName = (document) =>
  document.document_name || document.document || document.name || "Document";

const getDocumentNote = (document) =>
  document.additional_note || document.reason || document.note || "";

const getDocumentLevel = (document) =>
  document.required_level || document.status || "recommended";

const getDocumentUrl = (document) =>
  document.document_url || document.url || document.file_url || "";

const hasUploadedDocument = (document) =>
  Boolean(getDocumentUrl(document) || getUploadedDocumentName(document));

const byPackedStateAndSortOrder = (items = []) =>
  [...items].sort((a, b) => {
    const packedDifference =
      Number(Boolean(a.is_packed)) - Number(Boolean(b.is_packed));

    if (packedDifference) return packedDifference;

    return (a.sort_order || 0) - (b.sort_order || 0);
  });

const getUploadedDocumentName = (document) => {
  if (document.document_file_name) return document.document_file_name;

  const documentUrl = getDocumentUrl(document);
  if (!documentUrl) return "";

  try {
    return decodeURIComponent(documentUrl.split("/").pop() || "");
  } catch {
    return documentUrl.split("/").pop() || "";
  }
};

const buildDocumentPayload = ({
  document_name,
  required_level,
  additional_note,
  document_file_name,
  document_url,
}) => {
  const basePayload = {
    document_name: String(document_name || "").trim(),
    required_level: required_level || "recommended",
    additional_note: String(additional_note || "").trim(),
  };

  const uploadedFileName = String(document_file_name || "").trim();
  if (uploadedFileName) basePayload.document_file_name = uploadedFileName;

  if (!document_url) return basePayload;

  const formData = new FormData();
  Object.entries(basePayload).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("document_url", document_url);
  if (!uploadedFileName) {
    formData.append("document_file_name", document_url.name);
  }

  return formData;
};

const buildChangedDocumentPayload = (item, values) => {
  const nextValues = {
    document_name: String(values.document_name || "").trim(),
    required_level: values.required_level || "recommended",
    additional_note: String(values.additional_note || "").trim(),
    document_file_name: String(values.document_file_name || "").trim(),
  };
  const previousValues = {
    document_name: getDocumentName(item),
    required_level: getDocumentLevel(item),
    additional_note: getDocumentNote(item),
    document_file_name: getUploadedDocumentName(item),
  };
  const changedValues = {};

  Object.entries(nextValues).forEach(([key, value]) => {
    if (value !== previousValues[key]) changedValues[key] = value;
  });

  if (!values.document_url) return changedValues;

  const formData = new FormData();
  Object.entries(changedValues).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("document", values.document_url);

  return formData;
};

const hasPayloadChanges = (payload) => {
  if (payload instanceof FormData) {
    return Array.from(payload.keys()).length > 0;
  }

  return Object.keys(payload).length > 0;
};

const DocumentListSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2" aria-label="Loading documents">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="size-8 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="mt-4 h-7 w-24 animate-pulse rounded-md bg-primary/10" />
      </div>
    ))}
  </div>
);

const TripDocumentList = ({ tripId, onStatsChange }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deletingFileItem, setDeletingFileItem] = useState(null);
  const [uploadingDocumentId, setUploadingDocumentId] = useState(null);
  const [localItems, setLocalItems] = useState(null);
  const fileInputRefs = useRef({});
  const itemElementsRef = useRef(new Map());
  const previousPositionsRef = useRef(new Map());
  const { data, isFetching, isError, refetch } = useTripDocumentListQuery(
    { trip_id: tripId },
    { skip: !tripId },
  );
  const [createDocumentItem, { isLoading: isCreating }] =
    useCreateDocumentItemMutation();
  const [updateTripDocumentItem, { isLoading: isUpdating }] =
    useUpdateTripDocumentItemMutation();
  const [deleteDocumentItem, { isLoading: isDeleting }] =
    useDeleteDocumentItemMutation();
  const [deleteDocumentFileItem, { isLoading: isDeletingFile }] =
    useDeleteDocumentFileItemMutation();
  const documents = useMemo(
    () => byPackedStateAndSortOrder(data?.data || []),
    [data],
  );
  const visibleItems = useMemo(
    () => byPackedStateAndSortOrder(localItems || documents),
    [documents, localItems],
  );
  const isMutating = isCreating || isUpdating || isDeleting || isDeletingFile;

  useLayoutEffect(() => {
    const currentPositions = new Map();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    itemElementsRef.current.forEach((element, itemId) => {
      const currentPosition = element.getBoundingClientRect();
      currentPositions.set(itemId, currentPosition);

      const previousPosition = previousPositionsRef.current.get(itemId);
      const offsetX = previousPosition?.left - currentPosition.left;
      const offsetY = previousPosition?.top - currentPosition.top;

      if (
        !reduceMotion &&
        (offsetX || offsetY) &&
        typeof element.animate === "function"
      ) {
        element.animate(
          [
            { transform: `translate3d(${offsetX}px, ${offsetY}px, 0)` },
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

  const updateLocalItem = (documentItemId, patch) => {
    setLocalItems((currentItems) =>
      (currentItems || visibleItems).map((currentItem) =>
        currentItem.id === documentItemId
          ? { ...currentItem, ...patch }
          : currentItem,
      ),
    );
  };

  const openFilePicker = (documentId) => {
    fileInputRefs.current[documentId]?.click();
  };

  const handleCreateItem = async (payload) => {
    try {
      const response = await createDocumentItem({
        trip_id: tripId,
        payload,
      }).unwrap();
      const createdItem = getResponseItem(response);
      if (createdItem) {
        setLocalItems((currentItems) => [
          ...(currentItems || visibleItems),
          createdItem,
        ]);
        onStatsChange?.({
          totalDelta: 1,
          uploadedDelta: hasUploadedDocument(createdItem) ? 1 : 0,
          packedDelta: createdItem.is_packed ? 1 : 0,
        });
      }
      toast.success(response?.message || "Document created.");
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create document."));
      return false;
    }
  };

  const handleUpdateItem = async (documentItemId, payload) => {
    const previousItems = visibleItems;
    const previousItem = previousItems.find(
      (item) => item.id === documentItemId,
    );
    const wasUploaded = hasUploadedDocument(previousItem);
    const hasNewUpload =
      payload instanceof FormData && payload.has("document") && !wasUploaded;
    const optimisticPatch =
      payload instanceof FormData
        ? Object.fromEntries(payload.entries())
        : payload;

    updateLocalItem(documentItemId, optimisticPatch);
    setEditingItem(null);
    if (hasNewUpload) onStatsChange?.({ uploadedDelta: 1 });

    try {
      const response = await updateTripDocumentItem({
        trip_id: tripId,
        document_item_id: documentItemId,
        payload,
      }).unwrap();
      const responseItem = getResponseItem(response);
      if (responseItem) updateLocalItem(responseItem.id, responseItem);
      toast.success(response?.message || "Document updated.");
    } catch (error) {
      setLocalItems(previousItems);
      setEditingItem(previousItems.find((item) => item.id === documentItemId));
      if (hasNewUpload) onStatsChange?.({ uploadedDelta: -1 });
      toast.error(getApiErrorMessage(error, "Could not update document."));
    }
  };

  const handleUpload = async (documentItem, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const payload = new FormData();
    payload.append("document", file);
    setUploadingDocumentId(documentItem.id);
    const hadUploadedDocument = hasUploadedDocument(documentItem);
    const previousItems = visibleItems;
    updateLocalItem(documentItem.id, { document_file_name: file.name });
    if (!hadUploadedDocument) onStatsChange?.({ uploadedDelta: 1 });

    try {
      const response = await updateTripDocumentItem({
        trip_id: tripId,
        document_item_id: documentItem.id,
        payload,
      }).unwrap();
      const responseItem = getResponseItem(response);
      if (responseItem) updateLocalItem(responseItem.id, responseItem);
      toast.success(response?.message || "Document uploaded.");
    } catch (error) {
      setLocalItems(previousItems);
      if (!hadUploadedDocument) onStatsChange?.({ uploadedDelta: -1 });
      toast.error(getApiErrorMessage(error, "Could not upload document."));
    } finally {
      setUploadingDocumentId(null);
    }
  };

  const handleTogglePacked = async (documentItem, checked) => {
    const isPacked = checked === true;
    const wasPacked = Boolean(documentItem.is_packed);
    const previousItems = visibleItems;

    updateLocalItem(documentItem.id, { is_packed: isPacked });

    try {
      await updateTripDocumentItem({
        trip_id: tripId,
        document_item_id: documentItem.id,
        payload: { is_packed: isPacked },
      }).unwrap();
      if (wasPacked !== isPacked) {
        onStatsChange?.({ packedDelta: isPacked ? 1 : -1 });
      }
    } catch (error) {
      setLocalItems(previousItems);
      toast.error(
        getApiErrorMessage(error, "Could not update document status."),
      );
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;

    const previousItems = visibleItems;
    setLocalItems(previousItems.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
    if (editingItem?.id === deletingItem.id) setEditingItem(null);
    onStatsChange?.({
      totalDelta: -1,
      uploadedDelta: hasUploadedDocument(deletingItem) ? -1 : 0,
      packedDelta: deletingItem.is_packed ? -1 : 0,
    });

    try {
      const response = await deleteDocumentItem({
        trip_id: tripId,
        document_item_id: deletingItem.id,
      }).unwrap();
      toast.success(response?.message || "Document deleted.");
    } catch (error) {
      setLocalItems(previousItems);
      setDeletingItem(deletingItem);
      onStatsChange?.({
        totalDelta: 1,
        uploadedDelta: hasUploadedDocument(deletingItem) ? 1 : 0,
        packedDelta: deletingItem.is_packed ? 1 : 0,
      });
      toast.error(getApiErrorMessage(error, "Could not delete document."));
    }
  };

  const handleDeleteFile = async () => {
    if (!deletingFileItem) return;

    const previousItems = visibleItems;
    const hadUploadedDocument = hasUploadedDocument(deletingFileItem);
    updateLocalItem(deletingFileItem.id, {
      document_url: "",
      document_url_public_id: "",
      document_file_name: "",
    });
    setDeletingFileItem(null);
    if (hadUploadedDocument) onStatsChange?.({ uploadedDelta: -1 });

    try {
      const response = await deleteDocumentFileItem({
        trip_id: tripId,
        document_item_id: deletingFileItem.id,
      }).unwrap();
      const responseItem = getResponseItem(response);
      if (responseItem) updateLocalItem(responseItem.id, responseItem);
      toast.success(response?.message || "Uploaded document removed.");
    } catch (error) {
      setLocalItems(previousItems);
      setDeletingFileItem(deletingFileItem);
      if (hadUploadedDocument) onStatsChange?.({ uploadedDelta: 1 });
      toast.error(
        getApiErrorMessage(error, "Could not remove uploaded document."),
      );
    }
  };

  return (
    <>
      <PreviewCard className="space-y-5 md:rounded-t-none">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            icon={FileCheck2}
            title="Documents"
            description="Manage required documents and personal uploads from one place."
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

        {isFetching ? <DocumentListSkeleton /> : null}

        {!isFetching && isError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Could not load documents.
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
          <div className="grid gap-4 md:grid-cols-2">
            {visibleItems.length ? (
              visibleItems.map((documentItem) => (
                <div
                  key={documentItem.id}
                  ref={(element) => {
                    if (element) {
                      itemElementsRef.current.set(documentItem.id, element);
                    } else {
                      itemElementsRef.current.delete(documentItem.id);
                    }
                  }}
                  className="h-full will-change-transform"
                >
                  <DocumentItemCard
                    key={
                      editingItem?.id === documentItem.id ? "edit" : "view"
                    }
                    item={documentItem}
                    isEditing={editingItem?.id === documentItem.id}
                    isUpdating={isUpdating}
                    isDisabled={
                      isMutating && editingItem?.id !== documentItem.id
                    }
                    isUploading={uploadingDocumentId === documentItem.id}
                    onTogglePacked={(checked) =>
                      handleTogglePacked(documentItem, checked)
                    }
                    fileInputRef={(element) => {
                      if (element)
                        fileInputRefs.current[documentItem.id] = element;
                    }}
                    onUpload={(event) => handleUpload(documentItem, event)}
                    onOpenFilePicker={() => openFilePicker(documentItem.id)}
                    onEdit={() => setEditingItem(documentItem)}
                    onCancelEdit={() => setEditingItem(null)}
                    onSave={(payload) =>
                      handleUpdateItem(documentItem.id, payload)
                    }
                    onDelete={() => setDeletingItem(documentItem)}
                    onDeleteFile={() => setDeletingFileItem(documentItem)}
                  />
                </div>
              ))
            ) : (
              <EmptyState
                title="Empty Document list"
                description="You have no document list added in this trip yet!"
              />
            )}
          </div>
        ) : null}
      </PreviewCard>

      <DocumentCreateDialog
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
        title="Delete this document"
        description="Deleting this document will remove it from this trip. This action can't be undone."
        onConfirm={handleDeleteItem}
        isLoading={isDeleting}
      />
      <DeleteDialog
        open={Boolean(deletingFileItem)}
        onOpenChange={(open) => {
          if (!open) setDeletingFileItem(null);
        }}
        title="Remove uploaded document"
        description="This removes the uploaded file from the document item, but keeps the document in the trip list."
        confirmLabel="Remove file"
        onConfirm={handleDeleteFile}
        isLoading={isDeletingFile}
      />
    </>
  );
};

const DocumentItemCard = ({
  item,
  isEditing,
  isUpdating,
  isDisabled,
  isUploading,
  onTogglePacked,
  fileInputRef,
  onUpload,
  onOpenFilePicker,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onDeleteFile,
}) => {
  const nameRef = useRef(null);
  const [documentName, setDocumentName] = useState(getDocumentName(item));
  const [requiredLevel, setRequiredLevel] = useState(getDocumentLevel(item));
  const [additionalNote, setAdditionalNote] = useState(getDocumentNote(item));
  const [documentFileName, setDocumentFileName] = useState(
    getUploadedDocumentName(item),
  );
  const documentUrl = getDocumentUrl(item);
  const uploadedDocumentName = getUploadedDocumentName(item);

  useEffect(() => {
    if (!isEditing) return;

    requestAnimationFrame(() => nameRef.current?.focus());
  }, [isEditing]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!documentName.trim()) {
      toast.error("Add document name.");
      return;
    }

    const payload = buildChangedDocumentPayload(item, {
      document_name: documentName,
      required_level: requiredLevel,
      additional_note: additionalNote,
      document_file_name: documentFileName,
      document_url: null,
    });

    if (!hasPayloadChanges(payload)) {
      onCancelEdit();
      return;
    }

    await onSave(payload);
  };

  const cardClass =
    "h-full rounded-xl bg-white md:bg-slate-50 border border-slate-200 p-4";

  if (isEditing) {
    return (
      <form className={cardClass} onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <Checkbox checked={Boolean(item.is_packed)} disabled />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex justify-between gap-4">
              <input
                ref={nameRef}
                value={documentName}
                onChange={(event) => setDocumentName(event.target.value)}
                disabled={isUpdating}
                className="w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none disabled:opacity-60"
                required
              />
              <InlinePillSelect
                value={requiredLevel}
                onValueChange={setRequiredLevel}
                disabled={isUpdating}
                options={requiredLevelOptions}
                className={"border-slate-200 bg-white text-slate-500"}
              />
            </div>
            <textarea
              value={additionalNote}
              onChange={(event) => setAdditionalNote(event.target.value)}
              disabled={isUpdating}
              className="resize-none block w-full border-none bg-transparent p-0 text-sm font-normal leading-5 text-slate-500 outline-none disabled:opacity-60"
              placeholder="Additional note"
            />
            {documentFileName ? (
              <div className="flx gap-2 border rounded-md py-1 px-2 max-w-fit">
                <Paperclip size={14} />
                <input
                  label="Uploaded document name"
                  value={documentFileName}
                  onChange={(event) => setDocumentFileName(event.target.value)}
                  disabled={isUpdating}
                  className="block w-fit border-none bg-transparent p-0 text-sm font-normal leading-5 text-slate-500 outline-none disabled:opacity-60"
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-2 md:flex-row md:justify-end">
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
      </form>
    );
  }

  return (
    <article
      className={cn(
        "h-full rounded-xl border p-4 transition-[background-color,border-color] duration-300",
        item.is_packed
          ? "border-slate-100 bg-slate-50/80"
          : documentUrl
            ? "border-transparent bg-primary/10"
            : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={Boolean(item.is_packed)}
          disabled={isDisabled}
          onCheckedChange={onTogglePacked}
          className="mt-[2px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex h-[calc(100%-2.5rem)] flex-col justify-between">
            <div className="min-w-0 w-full">
              <div className="w-full flex gap-2 justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <p
                    className={cn(
                      "font-semibold",
                      item.is_packed
                        ? "text-slate-400 line-through"
                        : "text-slate-900",
                    )}
                  >
                    {getDocumentName(item)}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      levelStyles[getDocumentLevel(item)] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {formatLabel(getDocumentLevel(item))}
                  </span>
                </div>
                <PreviewActionsDropdown
              title="Document actions"
              description="Choose an action for this document."
              contentClassName="w-36"
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Document actions"
                  className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 -mt-1 -mr-2"
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
              {getDocumentNote(item) ? (
                <p className="mt-2 text-sm font-normal leading-6 text-slate-600">
                  {getDocumentNote(item)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flbx gap-4 mt-4">
            {documentUrl ? (
              <div className="flex min-w-0 items-center rounded-md bg-white px-2 py-1 text-xs max-w-4/5">
                <div className="flex min-w-0 w-full items-center gap-2">
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 flex-1 items-center gap-2 text-blue-800"
                  >
                    <Paperclip size={12} className="shrink-0" />

                    <span className="min-w-0 truncate">
                      {uploadedDocumentName || "Preview document"}
                    </span>
                  </a>

                  <button
                    type="button"
                    className="shrink-0 rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    disabled={isDisabled}
                    onClick={onDeleteFile}
                    aria-label="Remove document"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_DOCUMENT_TYPES}
                  className="hidden"
                  onChange={onUpload}
                />
                <button
                  className="py-1 px-2 rounded-md bg-primary/10 text-primary flx gap-1.5"
                  disabled={isDisabled || isUploading}
                  onClick={onOpenFilePicker}
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Upload size={14} />
                  )}
                  <span className="text-xs font-semibold">Upload</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

const DocumentCreateDialog = ({ open, onOpenChange, isLoading, onSubmit }) => {
  const [requiredLevel, setRequiredLevel] = useState("recommended");
  const [documentFile, setDocumentFile] = useState(null);
  const [documentFileName, setDocumentFileName] = useState("");

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setRequiredLevel("recommended");
      setDocumentFile(null);
      setDocumentFileName("");
    }
    onOpenChange(nextOpen);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setDocumentFile(file);
    if (file && !documentFileName.trim()) setDocumentFileName(file.name);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = buildDocumentPayload({
      document_name: formData.get("document_name"),
      required_level: requiredLevel,
      additional_note: formData.get("additional_note"),
      document_file_name: documentFileName,
      document_url: documentFile,
    });

    if (!payload.get?.("document_name") && !payload.document_name) {
      toast.error("Add document name.");
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
      <h2 className="text-lg font-bold mt-2 md:mt-0">Create document</h2>
      <p className="text-sm mt-1 text-slate-500">
        Add a document item and optionally attach the uploaded file now.
      </p>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <FloatingInput
          name="document_name"
          label="Document name"
          disabled={isLoading}
          required
        />
        <FloatingSelect
          label="Required level"
          value={requiredLevel}
          onValueChange={setRequiredLevel}
          disabled={isLoading}
        >
          {requiredLevelOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </FloatingSelect>
        <FloatingTextarea
          name="additional_note"
          label="Additional note"
          disabled={isLoading}
          rows={4}
          textareaClassName="min-h-32 leading-7"
        />

        <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
          <Upload size={14} />
          {documentFile ? "Change file" : "Choose file"}
          <input
            type="file"
            accept={ACCEPTED_DOCUMENT_TYPES}
            className="hidden"
            disabled={isLoading}
            onChange={handleFileChange}
          />
        </label>
        {documentFile ? (
          <p className="text-xs font-medium text-slate-500">
            {documentFile.name}
          </p>
        ) : null}
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
            {isLoading ? "Saving..." : "Create document"}
          </Button>
        </div>
      </form>
    </PreviewContent>
  );
};

export default TripDocumentList;
