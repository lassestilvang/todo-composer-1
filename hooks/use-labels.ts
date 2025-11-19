import { useState, useEffect } from "react";
import { Label } from "@/lib/types";

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabels = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/labels");
        if (!response.ok) {
          throw new Error("Failed to fetch labels");
        }

        const data = await response.json();
        setLabels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLabels();
  }, []);

  const refetch = () => {
    return fetch("/api/labels")
      .then((res) => res.json())
      .then((data) => {
        setLabels(data);
        return data;
      });
  };

  return { labels, loading, error, refetch };
}
