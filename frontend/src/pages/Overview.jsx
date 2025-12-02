import { useMemo, useState } from "react";
import LeftRail from "../components/LeftRail.jsx";
import FilterModal from "../components/FilterModal.jsx";
import BookmarkModal from "../components/BookmarkModal.jsx";

import BarBlock from "../components/charts/BarBlock.jsx";
import LineBlock from "../components/charts/LineBlock.jsx";
import PieBlock from "../components/charts/PieBlock.jsx";

import { useData } from "../context/DataContext.jsx";
import { useFilters } from "../context/FiltersContext.jsx";
import { applyFilters } from "../lib/applyFilters.js";
import { countBy, countByMulti, toChartData } from "../lib/aggregate.js";

export default function Overview() {
  const { tools, loading, error } = useData();
  const { filters } = useFilters();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  const filtered = useMemo(
    () => applyFilters(tools, filters),
    [tools, filters]
  );

  // ---- Example overview aggregations (same as before) ----
  const byFunding = useMemo(
    () => toChartData(countBy(filtered, r => r.fundingType), "fundingType"),
    [filtered]
  );

  const byOrgMaturity = useMemo(
    () => toChartData(countBy(filtered, r => r.orgMaturity), "orgMaturity"),
    [filtered]
  );

  const byCompanyFounded = useMemo(
    () =>
      toChartData(
        countBy(filtered, r => r.yearCompanyFounded),
        "yearCompanyFounded"
      ),
    [filtered]
  );

  const byBusinessModel = useMemo(
    () =>
      toChartData(
        countByMulti(filtered, r => r.businessModel || []),
        "businessModel"
      ),
    [filtered]
  );

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <LeftRail
        onOpenFilters={() => setFiltersOpen(true)}
        onOpenBookmarks={() => setBookmarksOpen(true)}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Top header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-950">
              Overview
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BarBlock
            title="Tools by Funding Type"
            data={byFunding}
            xKey="fundingType"
            yKey="count"
          />
          <BarBlock
            title="Tools by Org Maturity"
            data={byOrgMaturity}
            xKey="orgMaturity"
            yKey="count"
          />
          <PieBlock
            title="Tools by Business Model"
            data={byBusinessModel}
            nameKey="businessModel"
            valueKey="count"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LineBlock
            title="Companies by Year Founded"
            data={byCompanyFounded}
            xKey="yearCompanyFounded"
            yKey="count"
          />

          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="text-lg font-bold text-blue-950 mb-2">
              Total Tools
            </div>
            <div className="text-4xl font-extrabold text-blue-800">
              {filtered.length}
            </div>
            <div className="text-sm text-slate-600 mt-2">
              Based on current filters
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <FilterModal open={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <BookmarkModal open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
    </div>
  );
}
