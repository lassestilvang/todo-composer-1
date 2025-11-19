"use client";

import { useState, useEffect, useTransition } from "react";
import { ViewType, TaskWithRelations, List, Label } from "@/lib/types";
import { Sidebar } from "@/components/sidebar";
import { TaskList } from "@/components/task-list";
import { TaskForm } from "@/components/task-form";
import { ListForm } from "@/components/list-form";
import { LabelForm } from "@/components/label-form";
import { Search } from "@/components/search";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { useLists } from "@/hooks/use-lists";
import { useLabels } from "@/hooks/use-labels";
export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType | null>("today");
  const [currentListId, setCurrentListId] = useState<number | null>(null);
  const [currentLabelId, setCurrentLabelId] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [listFormOpen, setListFormOpen] = useState(false);
  const [labelFormOpen, setLabelFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(
    null
  );

  const { lists, refetch: refetchLists } = useLists();
  const { labels, refetch: refetchLabels } = useLabels();
  const {
    tasks,
    loading,
    refetch: refetchTasks,
  } = useTasks(
    currentView || "all",
    currentListId || undefined,
    showCompleted,
    searchQuery || undefined,
    currentLabelId || undefined
  );

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setCurrentListId(null);
    setCurrentLabelId(null);
  };

  const handleListSelect = (listId: number) => {
    setCurrentListId(listId);
    setCurrentView(null);
    setCurrentLabelId(null);
  };

  const handleLabelSelect = (labelId: number) => {
    setCurrentLabelId(labelId);
    setCurrentView(null);
    setCurrentListId(null);
  };

  const handleCreateTask = async (data: any) => {
    const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
    const method = editingTask ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    refetchTasks();
    setEditingTask(null);
  };

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: completed ? 1 : 0 }),
    });

    refetchTasks();
  };

  const handleSubtaskToggle = async (
    taskId: number,
    subtaskId: number,
    completed: boolean
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks?.map((st) =>
      st.id === subtaskId ? { ...st, completed: completed ? 1 : 0 } : st
    );

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtasks: updatedSubtasks }),
    });

    refetchTasks();
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      refetchTasks();
    }
  };

  const handleEditTask = (task: TaskWithRelations) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleCreateList = async (data: any) => {
    await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    refetchLists();
  };

  const handleCreateLabel = async (data: any) => {
    await fetch("/api/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    refetchLabels();
  };

  const getViewTitle = () => {
    if (currentLabelId) {
      const label = labels.find((l) => l.id === currentLabelId);
      return label ? `${label.emoji} ${label.name}` : "Label";
    }

    if (currentListId) {
      const list = lists.find((l) => l.id === currentListId);
      return list ? `${list.emoji} ${list.name}` : "List";
    }

    switch (currentView) {
      case "today":
        return "Today";
      case "next7days":
        return "Next 7 Days";
      case "upcoming":
        return "Upcoming";
      case "all":
        return "All Tasks";
      default:
        return "Tasks";
    }
  };

  const [, startTransition] = useTransition();

  useEffect(() => {
    // Enable View Transitions API
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      // View transitions are handled automatically by the browser
    }
  }, []);

  const handleViewChangeWithTransition = (view: ViewType) => {
    startTransition(() => {
      handleViewChange(view);
    });
  };

  const handleListSelectWithTransition = (listId: number) => {
    startTransition(() => {
      handleListSelect(listId);
    });
  };

  const handleLabelSelectWithTransition = (labelId: number) => {
    startTransition(() => {
      handleLabelSelect(labelId);
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentView={currentView}
        currentListId={currentListId}
        currentLabelId={currentLabelId}
        onViewChange={handleViewChangeWithTransition}
        onListSelect={handleListSelectWithTransition}
        onLabelSelect={handleLabelSelectWithTransition}
        lists={lists}
        labels={labels}
        onCreateList={() => setListFormOpen(true)}
        onCreateLabel={() => setLabelFormOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="glass border-b p-6 shadow-sm"
          style={{ borderColor: "hsl(var(--border) / 0.5)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {getViewTitle()}
            </h1>
            <Button
              onClick={() => {
                setEditingTask(null);
                setTaskFormOpen(true);
              }}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <Search value={searchQuery} onChange={setSearchQuery} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                Show completed
              </span>
            </label>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <TaskList
            tasks={tasks}
            loading={loading}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onSubtaskToggle={handleSubtaskToggle}
          />
        </main>
      </div>

      <TaskForm
        open={taskFormOpen}
        onOpenChange={(open) => {
          setTaskFormOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        lists={lists}
        labels={labels}
        onSubmit={handleCreateTask}
      />

      <ListForm
        open={listFormOpen}
        onOpenChange={setListFormOpen}
        onSubmit={handleCreateList}
      />

      <LabelForm
        open={labelFormOpen}
        onOpenChange={setLabelFormOpen}
        onSubmit={handleCreateLabel}
      />
    </div>
  );
}
