export type Priority = "high" | "medium" | "low" | "none";

export type RecurringType =
  | "daily"
  | "weekly"
  | "weekday"
  | "monthly"
  | "yearly"
  | "custom"
  | null;

export interface List {
  id: number;
  name: string;
  color: string;
  emoji: string;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  emoji: string;
  created_at: string;
}

export interface Subtask {
  id: number;
  task_id: number;
  name: string;
  completed: number;
  created_at: string;
}

export interface Task {
  id: number;
  list_id: number;
  name: string;
  description: string | null;
  date: string | null;
  deadline: string | null;
  reminder: string | null;
  estimate_minutes: number | null;
  actual_minutes: number | null;
  priority: Priority;
  recurring_type: RecurringType;
  recurring_config: string | null;
  attachment_path: string | null;
  position: number | null;
  completed: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithRelations extends Task {
  list?: List;
  labels?: Label[];
  subtasks?: Subtask[];
}

export interface TaskChange {
  id: number;
  task_id: number;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}

export type ViewType = "today" | "next7days" | "upcoming" | "all";
