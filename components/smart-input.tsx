"use client";

import { useState, useRef, useImperativeHandle, forwardRef, FormEvent } from "react";
import * as chrono from "chrono-node";
import { List } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface SmartInputHandle {
  focus: () => void;
}

interface SmartInputProps {
  lists: List[];
  currentListId: number | null;
  onCreateTask: (data: any) => Promise<void>;
}

export const SmartInput = forwardRef<SmartInputHandle, SmartInputProps>(
  ({ lists, currentListId, onCreateTask }, ref) => {
    const [value, setValue] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const parseInput = (raw: string) => {
      let text = raw.trim();
      let listId = currentListId ?? 1;
      let priority: "high" | "medium" | "low" | "none" = "none";
      let date: string | null = null;

      // Parse date/time with chrono
      const results = chrono.parse(text, new Date());
      if (results.length > 0) {
        const first = results[0];
        const dateObj = first.start.date();
        date = dateObj.toISOString();

        // Remove the parsed date text from the task name
        const { index, text: matchedText } = first;
        if (typeof index === "number" && matchedText) {
          text =
            text.slice(0, index) +
            text.slice(index + matchedText.length);
        }
      }

      // Extract list hashtag: #listname
      const listMatches = [...text.matchAll(/#([\p{L}\p{N}_-]+)/gu)];
      if (listMatches.length > 0) {
        const last = listMatches[listMatches.length - 1];
        const slug = last[1].toLowerCase();
        const match = lists.find(
          (l) => l.name.toLowerCase().replace(/\s+/g, "") === slug
        );
        if (match) {
          listId = match.id;
        }
        // Remove all list hashtags from text
        text = text.replace(/#([\p{L}\p{N}_-]+)/gu, "").trim();
      }

      // Extract priority: !high / !medium / !low
      const priorityMatch = text.match(/!(high|medium|low)/i);
      if (priorityMatch) {
        const level = priorityMatch[1].toLowerCase() as
          | "high"
          | "medium"
          | "low";
        priority = level;
        text = text.replace(/!(high|medium|low)/gi, "").trim();
      }

      const name = text.trim();

      return {
        list_id: listId,
        name,
        date,
        priority,
      };
    };

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      const raw = value.trim();
      if (!raw) return;

      const parsed = parseInput(raw);
      if (!parsed.name) {
        // If parsing stripped everything, fall back to raw as name
        parsed.name = raw;
      }

      setSubmitting(true);
      try {
        await onCreateTask(parsed);
        setValue("");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 w-full"
      >
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Quick add: "Buy milk tomorrow at 5pm #groceries !high"`}
          className="h-11 flex-1"
        />
        <Button
          type="submit"
          disabled={submitting || !value.trim()}
          className="h-11 px-4"
        >
          Add
        </Button>
      </form>
    );
  }
);

SmartInput.displayName = "SmartInput";
