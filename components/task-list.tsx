"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TaskWithRelations } from "@/lib/types";
import { TaskCard } from "@/components/task-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: TaskWithRelations[];
  loading: boolean;
  onToggleComplete: (taskId: number, completed: boolean) => void;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (taskId: number) => void;
  onSubtaskToggle?: (taskId: number, subtaskId: number, completed: boolean) => void;
}

export function TaskList({
  tasks,
  loading,
  onToggleComplete,
  onEdit,
  onDelete,
  onSubtaskToggle,
}: TaskListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
          />
          <span>Loading tasks...</span>
        </motion.div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center h-64"
      >
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2 font-medium">No tasks found</p>
          <p className="text-sm">Create a new task to get started</p>
        </div>
      </motion.div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-6">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: index * 0.05,
              }}
            >
              <TaskCard
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                onSubtaskToggle={onSubtaskToggle}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
