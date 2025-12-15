import { useState, useEffect } from "react";
import { TaskWithRelations, ViewType } from "@/lib/types";

export function useTasks(
  view: ViewType,
  listId?: number,
  showCompleted: boolean = false,
  search?: string,
  labelId?: number
) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          view,
          showCompleted: showCompleted.toString(),
        });

        if (listId) {
          params.append("listId", listId.toString());
        }

        if (labelId) {
          params.append("labelId", labelId.toString());
        }

        if (search) {
          params.append("search", search);
        }

        const response = await fetch(`/api/tasks?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [view, listId, showCompleted, search, labelId]);

  const refetch = () => {
    const params = new URLSearchParams({
      view,
      showCompleted: showCompleted.toString(),
    });

    if (listId) {
      params.append("listId", listId.toString());
    }

    if (labelId) {
      params.append("labelId", labelId.toString());
    }

    if (search) {
      params.append("search", search);
    }

    return fetch(`/api/tasks?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        return data;
      });
  };

  return { tasks, setTasks, loading, error, refetch };
}
