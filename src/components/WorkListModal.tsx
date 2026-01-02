"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { WorkListItem } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface WorkListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workList: WorkListItem[];
  onSave?: (workList: WorkListItem[]) => void;
  readOnly?: boolean;
}

export const WorkListModal: React.FC<WorkListModalProps> = ({
  open,
  onOpenChange,
  workList: initialWorkList,
  onSave,
  readOnly = false,
}) => {
  const [workList, setWorkList] = useState<WorkListItem[]>(initialWorkList);
  const [newItem, setNewItem] = useState({
    description: "",
    category: "",
    priority: "medium" as "high" | "medium" | "low",
  });

  // Update workList when initialWorkList changes
  useEffect(() => {
    setWorkList(initialWorkList);
  }, [initialWorkList]);

  const handleAddItem = () => {
    if (!newItem.description.trim()) {
      toast.error("Please enter work description");
      return;
    }

    if (!newItem.category.trim()) {
      toast.error("Please select type of work");
      return;
    }

    const item: WorkListItem = {
      id: `W${Date.now()}`,
      description: newItem.description.trim(),
      category: newItem.category,
      priority: newItem.priority,
    };

    setWorkList([...workList, item]);
    setNewItem({ description: "", category: "", priority: "medium" });

    toast.success("Work item added");
  };

  const handleRemoveItem = (id: string) => {
    setWorkList(workList.filter((item) => item.id !== id));
    toast.success("Work item removed");
  };

  const handleSave = () => {
    if (workList.length === 0) {
      toast.error("Please add at least one work item");
      return;
    }
    if (onSave) {
      onSave(workList);
    }
  };

  const workTypeOptions = [
    { value: "Solar", label: "Solar" },
    { value: "APFC", label: "APFC" },
    { value: "NSC & HT/LT", label: "NSC & HT/LT" },
    { value: "R/R", label: "R/R" },
    { value: "Post Evaluation", label: "Post Evaluation" },
    { value: "Audit", label: "Audit" },
    { value: "Other", label: "Other" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Work List Management
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? "View work items"
              : "Add and manage work items for this consumer"}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Existing work items */}
          {workList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Current Work Items
                </Label>
                <span className="text-sm text-muted-foreground">
                  Total: {workList.length}
                </span>
              </div>
              <div className="border rounded-lg overflow-hidden bg-card">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 text-xs font-semibold uppercase text-muted-foreground">
                        #
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase text-muted-foreground">
                        Type of Work
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase text-muted-foreground">
                        Description
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase text-muted-foreground">
                        Priority
                      </th>
                      {!readOnly && (
                        <th className="text-right p-4 text-xs font-semibold uppercase text-muted-foreground">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {workList.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-4 text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-md bg-primary/10 text-primary">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{item.description}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              item.priority === "high"
                                ? "bg-red-500/15 text-red-500"
                                : item.priority === "medium"
                                ? "bg-yellow-500/15 text-yellow-500"
                                : "bg-green-500/15 text-green-500"
                            }`}
                          >
                            {item.priority.toUpperCase()}
                          </span>
                        </td>
                        {!readOnly && (
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {workList.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No work items added yet</p>
              {!readOnly && (
                <p className="text-xs mt-1">Add items using the form below</p>
              )}
            </div>
          )}

          {/* Add new item form */}
          {!readOnly && (
            <div className="border-2 border-dashed rounded-lg p-5 bg-muted/20">
              <Label className="text-base font-semibold mb-4 block">
                Add New Work Item
              </Label>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="category"
                      className="text-sm font-medium mb-2 block"
                    >
                      Type of Work <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) =>
                        setNewItem({ ...newItem, category: value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent>
                        {workTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="priority"
                      className="text-sm font-medium mb-2 block"
                    >
                      Priority
                    </Label>
                    <Select
                      value={newItem.priority}
                      onValueChange={(value: "high" | "medium" | "low") =>
                        setNewItem({ ...newItem, priority: value })
                      }
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium mb-2 block"
                  >
                    Work Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    placeholder="Enter detailed description of the work to be done..."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be specific about what needs to be done
                  </p>
                </div>
                <Button
                  onClick={handleAddItem}
                  className="w-full gap-2 h-11 text-base font-medium"
                  disabled={!newItem.description.trim() || !newItem.category}
                >
                  <Plus size={18} />
                  Add Work Item to List
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {readOnly ? "Close" : "Cancel"}
          </Button>
          {!readOnly && (
            <Button
              onClick={handleSave}
              disabled={workList.length === 0}
              className="min-w-[120px]"
            >
              Save Work List ({workList.length})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
