import { useMemo, useState } from "react";
import LeftRail from "../components/LeftRail.jsx";
import FilterModal from "../components/FilterModal.jsx";
import BookmarkModal from "../components/BookmarkModal.jsx";
import ToolsTable from "../components/ToolsTable.jsx";

import BarBlock from "../components/charts/BarBlock.jsx";
import LineBlock from "../components/charts/LineBlock.jsx";
import PieBlock from "../components/charts/PieBlock.jsx";
import VennBlock from "../components/VennBlock.jsx"; 

import { useData } from "../context/DataContext.jsx";
import { useFilters } from "../context/FiltersContext.jsx";
import { applyFilters } from "../lib/applyFilters.js";
import { countBy, countByMulti, toChartData } from "../lib/aggregate.js";

export default function Details() {
  const { tools, loading, error } = useData();
  const { filters } = useFilters();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [tableView, setTableView] = useState("tech");

  const filtered = useMemo(
    () => applyFilters(tools, filters),
    [tools, filters]
  );

  const bySoftwareType = useMemo(
    () => toChartData(countBy(filtered, r => r.softwareType), "softwareType"),
    [filtered]
  );

  const byModelType = useMemo(
    () => toChartData(countBy(filtered, r => r.modelType), "modelType"),
    [filtered]
  );

  const byFoundationalModel = useMemo(
    () =>
      toChartData(
        countByMulti(filtered, r => r.foundationalModel || []),
        "foundationalModel"
      ),
    [filtered]
  );

  const byYearLaunched = useMemo(
    () => toChartData(countBy(filtered, r => r.yearLaunched), "yearLaunched"),
    [filtered]
  );

  const vennRows = useMemo(() => filtered, [filtered]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <LeftRail
        onOpenFilters={() => setFiltersOpen(true)}
        onOpenBookmarks={() => setBookmarksOpen(true)}
      />

      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-950">
              AI Tools Dashboard
            </h1>
            <div className="text-sm text-blue-900/70">
              Presented by ME-DMZ
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm hover:bg-blue-800"
            >
              Filters
            </button>
            <button
              onClick={() => setBookmarksOpen(true)}
              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-900 text-sm hover:bg-blue-200"
            >
              ⭐ Bookmarks
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BarBlock
            title="Tools by Software Type"
            data={bySoftwareType}
            xKey="softwareType"
            yKey="count"
          />
          <BarBlock
            title="Tools by Model Type"
            data={byModelType}
            xKey="modelType"
            yKey="count"
          />
          <PieBlock
            title="Tools by Foundational Model"
            data={byFoundationalModel}
            nameKey="foundationalModel"
            valueKey="count"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LineBlock
            title="Tools by Year Launched"
            data={byYearLaunched}
            xKey="yearLaunched"
            yKey="count"
          />
          <VennBlock title="Venn Breakdown" rows={vennRows} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTableView("tech")}
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              tableView === "tech"
                ? "bg-blue-700 text-white"
                : "bg-white border text-blue-900"
            }`}
          >
            View 1 (Tech)
          </button>
          <button
            onClick={() => setTableView("biz")}
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              tableView === "biz"
                ? "bg-blue-700 text-white"
                : "bg-white border text-blue-900"
            }`}
          >
            View 2 (Business)
          </button>
          <div className="text-sm text-slate-600 ml-auto">
            Showing {filtered.length} tools
          </div>
        </div>

        <ToolsTable rows={filtered} view={tableView} />
      </main>

      <FilterModal open={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <BookmarkModal open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
    </div>
  );
}
