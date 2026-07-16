import React from "react";
import { Button } from "@/components/ui/button";
import PreviewContent from "./preview-content";

const ConfirmDialog = ({
  open,
  onOpenChange,
  description,
  onConfirm,
  title = "Confirm action",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  destructive = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm?.();
  };

  return (
    <PreviewContent
      open={open}
      onOpenChange={onOpenChange}
      className="md:p-8 p-6 !max-w-xl h-fit"
    >
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-4 text-slate-500">
        {description || "Are you sure you want to proceed with this action?"}
      </p>
      <div className="mt-8 flex w-full justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => onOpenChange(false)}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          variant={variant}
          disabled={isLoading}
          className={destructive ? "bg-red-600 hover:bg-red-700" : ""}
        >
          {isLoading ? "Working..." : confirmLabel}
        </Button>
      </div>
    </PreviewContent>
  );
};

const DeleteDialog = ({
  open,
  onOpenChange,
  title = "Confirm action",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
}) => {
  const handleConfirm = async () => {
    await onConfirm?.();
  };

  return (
    <PreviewContent
      open={open}
      onOpenChange={onOpenChange}
      className="md:p-8 p-6 md:max-w-lg h-fit"
    >
      <h2 className="text-lg font-bold mt-2 md:mt-0">{title}</h2>
      <p className="mt-4 text-slate-500">
        {description || "Are you sure you want to proceed with this action?"}
      </p>
      <div className="mt-8 flex md:flex-row flex-col w-full md:justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => onOpenChange(false)}
          className="w-full md:w-auto"
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          variant={variant}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 focus:ring-red-500 w-full md:w-auto"
        >
          {isLoading ? "Working..." : confirmLabel}
        </Button>
      </div>
    </PreviewContent>
  );
};

export { ConfirmDialog, DeleteDialog };
export default ConfirmDialog;
