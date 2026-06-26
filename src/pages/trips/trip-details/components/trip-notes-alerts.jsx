import React, { useState } from "react";
import { AlertTriangle, Plus, ShieldCheck } from "lucide-react";

import { SectionHeader } from "@/components/shared/utils";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const TripNotesAlerts = ({ notes = [], alerts = [] }) => {
  const [activeNote, setActiveNote] = useState(null);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Card className="space-y-5">
        <SectionHeader
          icon={ShieldCheck}
          title="Notes"
          description="Save planning reminders and decisions"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">{notes.length} saved notes</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateNoteOpen(true)}
          >
            <Plus size={15} />
            New note
          </Button>
        </div>
        <div className="grid gap-3">
          {notes.length ? (
            notes.map((note) => (
              <div
                key={note.id}
                className="cursor-pointer rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                onClick={() => setActiveNote(note)}
                aria-label={`View ${note.title}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      {note.title}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                      {note.body}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400">{note.created_at}</p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              No notes saved yet.
            </p>
          )}
        </div>
      </Card>

      <Card className="space-y-5">
        <SectionHeader
          icon={AlertTriangle}
          title="Alerts"
          description="Important warnings and tasks that need attention."
        />
        <div className="grid gap-3">
          {alerts.length ? (
            alerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-xl border border-amber-200 bg-amber-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-amber-950">
                    {alert.title}
                  </h3>
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold capitalize text-amber-700">
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-amber-800">{alert.body}</p>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              No alerts available yet.
            </p>
          )}
        </div>
      </Card>

      <Dialog
        open={Boolean(activeNote)}
        onOpenChange={(open) => !open && setActiveNote(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeNote?.title}</DialogTitle>
            <DialogDescription>{activeNote?.created_at}</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-6 text-slate-600">{activeNote?.body}</p>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateNoteOpen} onOpenChange={setIsCreateNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create note</DialogTitle>
            <DialogDescription>
              Add a planning note for documents, route, timing, or personal
              reminders.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Textarea
              placeholder="Write a note..."
              className="min-h-36 resize-none rounded-xl border-slate-200"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateNoteOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsCreateNoteOpen(false)}>
              Create note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TripNotesAlerts;
