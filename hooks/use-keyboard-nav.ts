import { useEffect, useState } from "react";
import { TaskWithRelations } from "@/lib/types";

interface UseKeyboardNavOptions {
  tasks: TaskWithRelations[];
  onToggleComplete: (taskId: number, completed: boolean) => void;
  onDeleteTask: (taskId: number) => void;
  onCreateTaskShortcut: () => void;
}

export function useKeyboardNav({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onCreateTaskShortcut,
}: UseKeyboardNavOptions) {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;
      const tagName = activeElement?.tagName;

      // Ignore when typing in inputs or editable elements
      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        activeElement?.isContentEditable
      ) {
        return;
      }

      // j / k navigation
      if (event.key === "j" || event.key === "k") {
        if (!tasks.length) return;
        event.preventDefault();

        const currentIndex = selectedTaskId
          ? tasks.findIndex((t) => t.id === selectedTaskId)
          : -1;

        let nextIndex = currentIndex;
        if (event.key === "j") {
          nextIndex = currentIndex < tasks.length - 1 ? currentIndex + 1 : 0;
        } else if (event.key === "k") {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tasks.length - 1;
        }

        const nextTask = tasks[nextIndex];
        if (nextTask) {
          setSelectedTaskId(nextTask.id);
        }
        return;
      }

      // Space: toggle completion
      if (event.key === " " && selectedTaskId !== null) {
        event.preventDefault();
        const task = tasks.find((t) => t.id === selectedTaskId);
        if (task) {
          onToggleComplete(task.id, !task.completed);
        }
        return;
      }

      // c: create new task (focus smart input)
      if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        onCreateTaskShortcut();
        return;
      }

      // Delete: delete selected task
      if (event.key === "Delete" && selectedTaskId !== null) {
        event.preventDefault();
        const task = tasks.find((t) => t.id === selectedTaskId);
        if (task) {
          onDeleteTask(task.id);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [tasks, selectedTaskId, onToggleComplete, onDeleteTask, onCreateTaskShortcut]);

  return {
    selectedTaskId,
    setSelectedTaskId,
  };
}
