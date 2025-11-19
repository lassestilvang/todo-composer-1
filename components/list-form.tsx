"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const listSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string(),
  emoji: z.string(),
});

type ListFormData = z.infer<typeof listSchema>;

interface ListFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ListFormData) => Promise<void>;
}

const colors = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

const emojis = [
  "📋", "📝", "✅", "🎯", "🔥", "💡", "🚀", "⭐",
  "📌", "📅", "⏰", "🎨", "💼", "🏠", "🎓", "💪",
];

export function ListForm({ open, onOpenChange, onSubmit }: ListFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ListFormData>({
    resolver: zodResolver(listSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
      emoji: "📋",
    },
  });

  const selectedColor = watch("color");
  const selectedEmoji = watch("emoji");

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        color: "#3b82f6",
        emoji: "📋",
      });
    }
  }, [open, reset]);

  const onFormSubmit = async (data: ListFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create List</DialogTitle>
          <DialogDescription className="text-base">Create a new list to organize your tasks</DialogDescription>
          <DialogClose onOpenChange={onOpenChange} />
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div>
            <label className="text-sm font-semibold mb-2 block">Name *</label>
            <Input {...register("name")} className="mt-2 h-11" />
            {errors.name && (
              <p className="text-sm text-destructive mt-2">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Color</label>
            <div className="flex gap-3 mt-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={`
                    w-12 h-12 rounded-full border-2 transition-all hover:scale-110
                    ${selectedColor === color ? "border-foreground scale-125 shadow-lg" : "border-transparent hover:border-primary/50"}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Input
              type="text"
              {...register("color")}
              className="mt-3 h-11"
              placeholder="#3b82f6"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Emoji</label>
            <div className="flex flex-wrap gap-3 mt-3">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setValue("emoji", emoji)}
                  className={`
                    text-2xl p-3 rounded-lg border-2 transition-all hover:scale-110
                    ${selectedEmoji === emoji ? "border-foreground scale-125 shadow-lg bg-accent/50" : "border-transparent hover:border-primary/50"}
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <Input
              type="text"
              {...register("emoji")}
              className="mt-3 h-11"
              placeholder="📋"
              maxLength={2}
            />
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
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
