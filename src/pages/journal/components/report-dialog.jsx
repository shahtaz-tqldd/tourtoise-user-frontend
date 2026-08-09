import React, { useState } from "react";

import PreviewContent from "@/components/shared/preview-content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ReportDialog = ({
  open,
  onOpenChange,
  subject = "content",
  onReport,
  isLoading,
}) => {
  const [reason, setReason] = useState("");

  const handleOpenChange = (nextOpen) => {
    if (isLoading) return;
    if (!nextOpen) setReason("");
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedReason = reason.trim();
    if (!trimmedReason || isLoading) return;

    const reported = await onReport(trimmedReason);
    if (reported) {
      setReason("");
      onOpenChange(false);
    }
  };

  return (
    <PreviewContent
      open={open}
      onOpenChange={handleOpenChange}
      title={`Report ${subject}`}
      description={`Tell us why you are reporting this ${subject}.`}
      className="h-fit p-6 md:p-8 md:max-w-lg"
    >
      <form onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold text-slate-950">Report {subject}</h2>
        <p className="mt-2 text-sm text-slate-500">
          Tell us why this {subject} should be reviewed.
        </p>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason for reporting..."
          rows={5}
          autoFocus
          className="mt-5 resize-none rounded-xl bg-white"
        />
        <div className="mt-6 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !reason.trim()}>
            {isLoading ? "Reporting..." : "Submit report"}
          </Button>
        </div>
      </form>
    </PreviewContent>
  );
};

export default ReportDialog;
