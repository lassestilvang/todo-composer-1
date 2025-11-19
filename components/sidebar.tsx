"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Inbox,
  Calendar,
  CalendarDays,
  CalendarClock,
  ListTodo,
  Tag,
  Plus,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { ViewType, List, Label } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOverdue } from "@/hooks/use-overdue";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentView: ViewType | null;
  currentListId: number | null;
  currentLabelId: number | null;
  onViewChange: (view: ViewType) => void;
  onListSelect: (listId: number) => void;
  onLabelSelect: (labelId: number) => void;
  lists: List[];
  labels: Label[];
  onCreateList: () => void;
  onCreateLabel: () => void;
}

export function Sidebar({
  currentView,
  currentListId,
  currentLabelId,
  onViewChange,
  onListSelect,
  onLabelSelect,
  lists,
  labels,
  onCreateList,
  onCreateLabel,
}: SidebarProps) {
  const { count: overdueCount } = useOverdue();
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDarkMode = () => {
    if (!isMounted || typeof window === "undefined") return false;
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  };

  const views = [
    { id: "today" as ViewType, name: "Today", icon: Calendar },
    { id: "next7days" as ViewType, name: "Next 7 Days", icon: CalendarDays },
    { id: "upcoming" as ViewType, name: "Upcoming", icon: CalendarClock },
    { id: "all" as ViewType, name: "All", icon: ListTodo },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? "80px" : "280px" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen glass-strong border-r flex flex-col shadow-xl"
      style={{ borderColor: "hsl(var(--border) / 0.5)" }}
    >
      <div
        className={cn(
          "border-b flex items-center justify-center relative",
          isCollapsed ? "p-4" : "p-6",
          "border-color: hsl(var(--border) / 0.5)"
        )}
        style={{ borderColor: "hsl(var(--border) / 0.5)" }}
      >
        {!isCollapsed && <h1 className="text-xl font-bold">Tasks</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "hover:bg-accent/50 transition-all duration-200",
            isCollapsed ? "mx-auto" : "absolute right-4"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto space-y-6",
          isCollapsed ? "p-3" : "p-6 space-y-8"
        )}
      >
        {/* Views */}
        <div>
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Views
            </h2>
          )}
          <div className="space-y-1">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = currentView === view.id;
              return (
                <motion.button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-full flex items-center rounded-lg text-sm transition-all duration-200 font-semibold relative group border-2",
                    isCollapsed
                      ? "justify-center px-0 py-2.5"
                      : "gap-3 px-4 py-3",
                    isActive
                      ? "bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground shadow-lg shadow-primary/50 ring-2 ring-primary/30 ring-inset border-primary/40"
                      : "border-transparent hover:bg-accent/80 text-foreground hover:shadow-md hover:border-primary hover:border-opacity-100"
                  )}
                  title={isCollapsed ? view.name : undefined}
                >
                  <Icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
                  {!isCollapsed && (
                    <span className="font-medium">{view.name}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Lists */}
        <div>
          <div className="flex items-center justify-between mb-2">
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-muted-foreground uppercase">
                Lists
              </h2>
            )}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onCreateList}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {lists.map((list) => {
              const isActive = currentListId === list.id;
              return (
                <motion.button
                  key={list.id}
                  onClick={() => onListSelect(list.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-full flex items-center rounded-lg text-sm transition-all duration-200 font-semibold relative group border-2",
                    isCollapsed
                      ? "justify-center px-0 py-2.5"
                      : "gap-3 px-4 py-3",
                    isActive
                      ? "bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground shadow-lg shadow-primary/50 ring-2 ring-primary/30 ring-inset border-primary/40"
                      : "border-transparent hover:bg-accent/80 text-foreground hover:shadow-md hover:border-primary hover:border-opacity-100"
                  )}
                  title={isCollapsed ? list.name : undefined}
                >
                  <span
                    className={cn(isCollapsed ? "text-2xl" : "text-lg")}
                    style={{ color: list.color }}
                  >
                    {list.emoji}
                  </span>
                  {!isCollapsed && (
                    <span className="flex-1 text-left font-medium">
                      {list.name}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Labels */}
        <div>
          <div className="flex items-center justify-between mb-2">
            {!isCollapsed && (
              <h2 className="text-xs font-semibold text-muted-foreground uppercase">
                Labels
              </h2>
            )}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onCreateLabel}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {labels.map((label) => {
              const isActive = currentLabelId === label.id;
              return (
                <motion.button
                  key={label.id}
                  onClick={() => onLabelSelect(label.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-full flex items-center rounded-lg text-sm transition-all duration-200 font-semibold relative group border-2",
                    isCollapsed
                      ? "justify-center px-0 py-2.5"
                      : "gap-3 px-4 py-3",
                    isActive
                      ? "bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground shadow-lg shadow-primary/50 ring-2 ring-primary/30 ring-inset border-primary/40"
                      : "border-transparent hover:bg-accent/80 text-foreground hover:shadow-md hover:border-primary hover:border-opacity-100"
                  )}
                  title={isCollapsed ? label.name : undefined}
                >
                  <Tag
                    className={cn("h-4 w-4", isCollapsed && "h-5 w-5")}
                    style={{ color: label.color }}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 text-left font-medium">
                      {label.name}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className="mt-auto border-t"
        style={{ borderColor: "hsl(var(--border) / 0.5)" }}
      >
        {/* Overdue Badge */}
        {overdueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(isCollapsed ? "p-2" : "p-4 px-6")}
          >
            {isCollapsed ? (
              <Badge
                variant="destructive"
                className="w-full justify-center py-2 shadow-lg text-xs px-1.5"
                title={`${overdueCount} Overdue`}
              >
                {overdueCount}
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                className="w-full justify-center py-2 shadow-lg"
              >
                {overdueCount} Overdue
              </Badge>
            )}
          </motion.div>
        )}

        {/* Theme Toggle */}
        <div
          className={cn(
            "flex justify-center",
            isCollapsed ? "p-2 pb-4" : "p-4 px-6 pb-6"
          )}
        >
          <Button
            variant="outline"
            size={isCollapsed ? "icon" : "sm"}
            onClick={() => {
              const currentTheme = isDarkMode() ? "dark" : "light";
              setTheme(currentTheme === "light" ? "dark" : "light");
            }}
            className={cn(
              "transition-all duration-200",
              !isCollapsed && "w-auto px-4"
            )}
            title={
              !isDarkMode() ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {!isCollapsed ? (
              <div className="flex items-center justify-center gap-2">
                {!isDarkMode() ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span className="text-sm">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span className="text-sm">Dark</span>
                  </>
                )}
              </div>
            ) : !isDarkMode() ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}
