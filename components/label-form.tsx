"use client";

import { useEffect } from "react";
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

const labelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string(),
  emoji: z.string(),
});

type LabelFormData = z.infer<typeof labelSchema>;

interface LabelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LabelFormData) => Promise<void>;
}

const colors = [
  "#6b7280", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

const emojis = [
  "🏷️", "🔖", "⭐", "🔥", "💡", "🎯", "🚀", "💪",
  "📌", "📝", "✅", "⏰", "🎨", "💼", "🏠", "🎓",
];

export function LabelForm({ open, onOpenChange, onSubmit }: LabelFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<LabelFormData>({
    resolver: zodResolver(labelSchema),
    defaultValues: {
      name: "",
      color: "#6b7280",
      emoji: "🏷️",
    },
  });

  const selectedColor = watch("color");
  const selectedEmoji = watch("emoji");

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        color: "#6b7280",
        emoji: "🏷️",
      });
    }
  }, [open, reset]);

  const onFormSubmit = async (data: LabelFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Label</DialogTitle>
          <DialogDescription className="text-base">Create a new label to categorize your tasks</DialogDescription>
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
              placeholder="#6b7280"
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
              placeholder="🏷️"
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
