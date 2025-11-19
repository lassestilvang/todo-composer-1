import { useState, useEffect } from "react";
import { List } from "@/lib/types";

export function useLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/lists");
        if (!response.ok) {
          throw new Error("Failed to fetch lists");
        }

        const data = await response.json();
        setLists(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  const refetch = () => {
    return fetch("/api/lists")
      .then((res) => res.json())
      .then((data) => {
        setLists(data);
        return data;
      });
  };

  return { lists, loading, error, refetch };
}
