"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  TaskWithRelations,
  Priority,
  RecurringType,
  List,
  Label,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { parseTimeToMinutes } from "@/lib/utils";

const taskSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  list_id: z.number(),
  date: z.string().optional(),
  deadline: z.string().optional(),
  reminder: z.string().optional(),
  estimate_minutes: z.number().optional(),
  actual_minutes: z.number().optional(),
  priority: z.enum(["high", "medium", "low", "none"]),
  recurring_type: z
    .enum(["daily", "weekly", "weekday", "monthly", "yearly", "custom"])
    .nullable()
    .optional()
    .or(z.literal("")),
  recurring_config: z.string().optional(),
  labels: z.array(z.number()).optional(),
  subtasks: z.array(z.object({ name: z.string() })).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithRelations | null;
  lists: List[];
  labels: Label[];
  onSubmit: (data: TaskFormData) => Promise<void>;
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  lists,
  labels,
  onSubmit,
}: TaskFormProps) {
  const [estimateTime, setEstimateTime] = useState("00:00");
  const [actualTime, setActualTime] = useState("00:00");
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [subtasks, setSubtasks] = useState<{ name: string }[]>([]);
  const [newSubtask, setNewSubtask] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      description: "",
      list_id: 1,
      priority: "none",
      labels: [],
      subtasks: [],
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        name: task.name,
        description: task.description || "",
        list_id: task.list_id,
        date: task.date ? task.date.split("T")[0] : "",
        deadline: task.deadline ? task.deadline.split("T")[0] : "",
        reminder: task.reminder || "",
        priority: task.priority,
        recurring_type: task.recurring_type || null,
        recurring_config: task.recurring_config || "",
      });

      if (task.estimate_minutes) {
        const hours = Math.floor(task.estimate_minutes / 60);
        const minutes = task.estimate_minutes % 60;
        setEstimateTime(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`
        );
      }

      if (task.actual_minutes) {
        const hours = Math.floor(task.actual_minutes / 60);
        const minutes = task.actual_minutes % 60;
        setActualTime(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`
        );
      }

      setSelectedLabels(task.labels?.map((l) => l.id) || []);
      setSubtasks(task.subtasks?.map((st) => ({ name: st.name })) || []);
    } else {
      reset({
        name: "",
        description: "",
        list_id: 1,
        priority: "none",
        labels: [],
        subtasks: [],
      });
      setEstimateTime("00:00");
      setActualTime("00:00");
      setSelectedLabels([]);
      setSubtasks([]);
    }
  }, [task, reset]);

  const onFormSubmit = async (data: TaskFormData) => {
    const submitData = {
      ...data,
      estimate_minutes: estimateTime
        ? parseTimeToMinutes(estimateTime)
        : undefined,
      actual_minutes: actualTime ? parseTimeToMinutes(actualTime) : undefined,
      labels: selectedLabels,
      subtasks,
    };

    await onSubmit(submitData);
    onOpenChange(false);
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { name: newSubtask.trim() }]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const toggleLabel = (labelId: number) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-strong">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {task ? "Edit Task" : "Create Task"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {task ? "Update task details" : "Add a new task to your list"}
          </DialogDescription>
          <DialogClose onOpenChange={onOpenChange} />
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div>
            <label className="text-sm font-semibold mb-2 block">Name *</label>
            <Input {...register("name")} className="mt-2 h-11" />
            {errors.name && (
              <p className="text-sm text-destructive mt-2">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">
              Description
            </label>
            <Textarea {...register("description")} className="mt-2" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold mb-2 block">List</label>
              <Select
                {...register("list_id", { valueAsNumber: true })}
                className="mt-2 h-11"
              >
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.emoji} {list.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                Priority
              </label>
              <Select {...register("priority")} className="mt-2 h-11">
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold mb-2 block">Date</label>
              <Input type="date" {...register("date")} className="mt-2 h-11" />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                Deadline
              </label>
              <Input
                type="date"
                {...register("deadline")}
                className="mt-2 h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Estimate (HH:mm)
              </label>
              <Input
                type="time"
                value={estimateTime}
                onChange={(e) => setEstimateTime(e.target.value)}
                className="mt-2 h-11"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
                Actual (HH:mm)
              </label>
              <Input
                type="time"
                value={actualTime}
                onChange={(e) => setActualTime(e.target.value)}
                className="mt-2 h-11"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Reminder</label>
            <Input
              type="datetime-local"
              {...register("reminder")}
              className="mt-2 h-11"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">
              Recurring
            </label>
            <Select {...register("recurring_type")} className="mt-2 h-11">
              <option value="">None</option>
              <option value="daily">Every day</option>
              <option value="weekly">Every week</option>
              <option value="weekday">Every weekday</option>
              <option value="monthly">Every month</option>
              <option value="yearly">Every year</option>
              <option value="custom">Custom</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Labels</label>
            <div className="mt-3 space-y-3">
              {labels.map((label) => (
                <label
                  key={label.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedLabels.includes(label.id)}
                    onChange={() => toggleLabel(label.id)}
                  />
                  <span style={{ color: label.color }}>{label.emoji}</span>
                  <span>{label.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Subtasks</label>
            <div className="mt-3 space-y-3">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={subtask.name}
                    onChange={(e) => {
                      const newSubtasks = [...subtasks];
                      newSubtasks[index].name = e.target.value;
                      setSubtasks(newSubtasks);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubtask(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                  placeholder="Add subtask"
                />
                <Button type="button" onClick={addSubtask}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 px-6"
            >
              {isSubmitting ? "Saving..." : task ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
