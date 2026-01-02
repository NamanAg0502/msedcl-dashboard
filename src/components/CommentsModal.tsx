"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Consumer, Note } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBadge } from "./RoleBadge";

interface Props {
  open: boolean;
  onClose: () => void;
  consumer: Consumer | null;
  onAddComment: (consumerId: string, comment: string) => Promise<void>;
  readOnly?: boolean;
}

export const CommentsModal: React.FC<Props> = ({
  open,
  onClose,
  consumer,
  onAddComment,
  readOnly = false,
}) => {
  const { currentAgent } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!consumer || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(consumer.id, newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAgentRole = (note: Note) => {
    // Try to determine role from the agent name or action
    if (note.createdBy.startsWith("EVAL")) return "evaluator";
    if (note.createdBy.startsWith("PROP")) return "proposal_maker";
    if (note.createdBy.startsWith("SALES")) return "sales";
    if (note.createdBy.startsWith("ADMIN")) return "admin";
    return "admin";
  };

  if (!consumer) return null;

  const allNotes = [...consumer.notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Comments & History - {consumer.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-4 py-4">
              {allNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No comments yet</p>
                </div>
              ) : (
                allNotes.map((note) => (
                  <div
                    key={note.id}
                    className="border border-border rounded-lg p-4 bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {note.createdByName}
                        </span>
                        <RoleBadge role={getAgentRole(note)} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {note.action && (
                      <div className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium mb-2">
                        {note.action}
                      </div>
                    )}
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {note.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {!readOnly && (
            <div className="border-t border-border pt-4 mt-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="mb-3"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Close
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !newComment.trim()}
                >
                  {isSubmitting ? "Adding..." : "Add Comment"}
                </Button>
              </div>
            </div>
          )}

          {readOnly && (
            <div className="border-t border-border pt-4 mt-4">
              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
