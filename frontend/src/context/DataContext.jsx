import { createContext, useContext, useEffect, useState } from "react";

const DataCtx = createContext();

export function DataProvider({ children }) {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const base = import.meta.env.VITE_API_BASE;
        const res = await fetch(`${base}/api/tools`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setTools(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DataCtx.Provider value={{ tools, loading, error }}>
      {children}
    </DataCtx.Provider>
  );
}

export const useData = () => useContext(DataCtx);
