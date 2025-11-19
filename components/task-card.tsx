"use client";

import { useState } from "react";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Flag,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  MoreVertical,
  Trash2,
  Edit,
} from "lucide-react";
import { TaskWithRelations, Priority } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatTime,
  isToday,
  isTomorrow,
  isOverdue,
  formatMinutesToTime,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskWithRelations;
  onToggleComplete: (taskId: number, completed: boolean) => void;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (taskId: number) => void;
  onSubtaskToggle?: (taskId: number, subtaskId: number, completed: boolean) => void;
}

const priorityColors: Record<Priority, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
  none: "bg-transparent",
};

const priorityLabels: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "",
};

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onSubtaskToggle,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showMenu]);

  const handleToggle = () => {
    onToggleComplete(task.id, !task.completed);
  };

  const handleSubtaskToggle = (subtaskId: number, completed: boolean) => {
    if (onSubtaskToggle) {
      onSubtaskToggle(task.id, subtaskId, completed);
    }
  };

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.3
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="card"
    >
      <Card
        className={cn(
          "glass p-6 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/10",
          task.completed && "completed opacity-70"
        )}
      >
        <div className="flex items-start gap-3">
          <motion.button
            onClick={handleToggle}
            className="mt-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {task.completed ? (
              <CheckCircle2 className="h-6 w-6 text-primary drop-shadow-sm" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </motion.button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3
                  className={cn(
                    "font-medium text-base",
                    task.completed && "line-through text-muted-foreground"
                  )}
                >
                  {task.name}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                )}
              </div>

                <div className="flex items-center gap-3">
                {task.priority !== "none" && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs shadow-sm",
                      priorityColors[task.priority] && "border-current bg-gradient-to-r from-primary/10 to-accent/10"
                    )}
                  >
                    <Flag
                      className={cn(
                        "h-3 w-3 mr-1",
                        priorityColors[task.priority]
                      )}
                      fill={priorityColors[task.priority] !== "bg-transparent" ? "currentColor" : "none"}
                    />
                    {priorityLabels[task.priority]}
                  </Badge>
                )}

                <div className="relative">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-accent/50"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-12 z-10 glass-strong border rounded-lg shadow-2xl py-2 min-w-[140px]" style={{ borderColor: "hsl(var(--border) / 0.5)" }}
                      >
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          onEdit(task);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-sm hover:bg-accent/50 flex items-center gap-2 transition-colors rounded-md mx-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          onDelete(task.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-sm hover:bg-destructive/20 text-destructive flex items-center gap-2 transition-colors rounded-md mx-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {task.labels.map((label) => (
                  <Badge
                    key={label.id}
                    variant="outline"
                    className="text-xs shadow-sm"
                    style={{ borderColor: label.color }}
                  >
                    <span className="mr-1.5 text-sm">{label.emoji}</span>
                    {label.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-5 mt-4 text-xs text-muted-foreground">
              {task.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {isToday(task.date)
                      ? "Today"
                      : isTomorrow(task.date)
                      ? "Tomorrow"
                      : formatDate(task.date)}
                  </span>
                </div>
              )}

              {task.deadline && (
                <div
                  className={cn(
                    "flex items-center gap-1",
                    isOverdue(task.deadline) && "text-destructive font-semibold"
                  )}
                >
                  <Clock className="h-3 w-3" />
                  <span>
                    Due {isToday(task.deadline) ? "today" : formatDate(task.deadline)}
                  </span>
                </div>
              )}

              {task.estimate_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Est: {formatMinutesToTime(task.estimate_minutes)}</span>
                </div>
              )}

              {task.actual_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Actual: {formatMinutesToTime(task.actual_minutes)}</span>
                </div>
              )}
            </div>

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-4">
                <motion.button
                  onClick={() => setExpanded(!expanded)}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  <motion.div
                    animate={{ rotate: expanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </motion.div>
                  <span>
                    {completedSubtasks}/{totalSubtasks} subtasks
                  </span>
                </motion.button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 ml-7 space-y-2"
                    >
                    {task.subtasks.map((subtask) => (
                      <motion.label
                        key={subtask.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 text-sm cursor-pointer group"
                      >
                        <Checkbox
                          checked={!!subtask.completed}
                          onChange={(e) =>
                            handleSubtaskToggle(subtask.id, e.target.checked)
                          }
                        />
                        <span
                          className={cn(
                            "group-hover:text-foreground transition-colors",
                            subtask.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {subtask.name}
                        </span>
                      </motion.label>
                    ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
