import { useState, useEffect } from "react";

export function useOverdue() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const response = await fetch("/api/overdue");
        if (response.ok) {
          const data = await response.json();
          setCount(data.count);
        }
      } catch (err) {
        console.error("Failed to fetch overdue count:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverdue();
    const interval = setInterval(fetchOverdue, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  return { count, loading };
}
