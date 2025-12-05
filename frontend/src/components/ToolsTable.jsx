import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

const MAX_SELECT = 10;

export default function ToolsTable({ rows = [], view = "tech" }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [creditsLeft, setCreditsLeft] = useState(null); // null until first export response
  const [msg, setMsg] = useState("");
  const [exporting, setExporting] = useState(false);

  // Reset selection if rows change a lot (filters, etc.)
  useEffect(() => {
    setSelectedIds([]);
    setMsg("");
  }, [rows]);

  const allIdsOnPage = useMemo(() => {
    return rows
      .map(r => r?._raw?.INFRA_ID || r?._raw?.infra_id || r?.infraId)
      .filter(Boolean);
  }, [rows]);

  const toggleOne = (id) => {
    setMsg("");
    setSelectedIds(prev => {
      const has = prev.includes(id);
      if (has) return prev.filter(x => x !== id);

      if (prev.length >= MAX_SELECT) {
        setMsg(`You can only select up to ${MAX_SELECT} tools per export.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleAll = () => {
    setMsg("");
    setSelectedIds(prev => {
      if (prev.length === allIdsOnPage.length) return [];
      return allIdsOnPage.slice(0, MAX_SELECT);
    });

    if (allIdsOnPage.length > MAX_SELECT) {
      setMsg(`Select All grabbed the first ${MAX_SELECT} results (export cap).`);
    }
  };

  async function exportSelected() {
    setMsg("");
    if (!selectedIds.length) {
      setMsg("Select at least one tool first.");
      return;
    }

    if (creditsLeft === 0) {
      setMsg("You’ve hit your export limit for the last 24 hours.");
      return;
    }

    const jwt = Cookies.get("idToken");
    if (!jwt) {
      setMsg("Missing login token. Please sign out and sign in again.");
      return;
    }

    setExporting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/export`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`
          },
          body: JSON.stringify({
            infraIds: selectedIds,
            format: "json"
          })
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setCreditsLeft(data.exportsLeft ?? 0);
        setMsg(data.error || "Export failed.");
        return;
      }

      // backend returns { ok:true, exportsLeft, rows:[...] }
      const exportedRows = data.rows || [];
      const left = data.exportsLeft;
      setCreditsLeft(left);

      // download json
      const blob = new Blob(
        [JSON.stringify(exportedRows, null, 2)],
        { type: "application/json" }
      );
      downloadBlob(blob, `ai-tools-export-${Date.now()}.json`);

      setMsg(`Exported ${exportedRows.length} tools. Exports left (24h): ${left}.`);
      setSelectedIds([]);
    } catch (e) {
      setMsg(e.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={toggleAll}
            className="px-2 py-1 rounded-md border text-blue-900 hover:bg-blue-50"
          >
            {selectedIds.length === allIdsOnPage.length ? "Clear All" : "Select All"}
          </button>

          <div className="text-blue-900/80">
            Selected: <b>{selectedIds.length}</b> / {MAX_SELECT}
          </div>

          <div className="text-blue-900/60">
            Exports left (24h):{" "}
            <b>{creditsLeft == null ? "—" : creditsLeft}</b>
          </div>
        </div>

        <button
          onClick={exportSelected}
          disabled={exporting}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition
            ${exporting ? "bg-blue-200 text-blue-900" : "bg-blue-700 text-white hover:bg-blue-800"}
          `}
        >
          Export JSON
        </button>
      </div>

      {msg && (
        <div className="text-sm mb-3 text-red-600">
          {msg}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 w-10"></th>
              <th className="p-2 text-left">Tool Name</th>
              <th className="p-2 text-left">Tasks</th>
              <th className="p-2 text-left">Software Type</th>
              <th className="p-2 text-left">Expected Input</th>
              <th className="p-2 text-left">Generated Output</th>
              {view === "tech" ? (
                <th className="p-2 text-left">Model Type</th>
              ) : (
                <>
                  <th className="p-2 text-left">Parent Org</th>
                  <th className="p-2 text-left">Funding</th>
                </>
              )}
              <th className="p-2 text-left w-14">View</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => {
              const id =
                r?._raw?.INFRA_ID ||
                r?._raw?.infra_id ||
                r?.infraId ||
                r?.toolName ||
                `${idx}`;

              const checked = selectedIds.includes(id);

              return (
                <tr key={id} className="border-t">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(id)}
                    />
                  </td>

                  <td className="p-2 font-semibold text-blue-700">
                    {r?.toolName || "—"}
                  </td>

                  <td className="p-2">
                    {(r?.tasks || []).join(", ") || "—"}
                  </td>

                  <td className="p-2">
                    {r?.softwareType || "—"}
                  </td>

                  <td className="p-2">
                    {(r?.expectedInput || []).join(", ") || "—"}
                  </td>

                  <td className="p-2">
                    {(r?.generatedOutput || []).join(", ") || "—"}
                  </td>

                  {view === "tech" ? (
                    <td className="p-2">{r?.modelType || "—"}</td>
                  ) : (
                    <>
                      <td className="p-2">{r?.parentOrg || "—"}</td>
                      <td className="p-2">{r?.fundingType || "—"}</td>
                    </>
                  )}

                  <td className="p-2">
                    <Link
                      to={`/tool/${encodeURIComponent(id)}`}
                      className="text-blue-700 hover:underline"
                    >
                      👁
                    </Link>
                  </td>
                </tr>
              );
            })}

            {!rows.length && (
              <tr>
                <td className="p-4 text-blue-900/70" colSpan={9}>
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
