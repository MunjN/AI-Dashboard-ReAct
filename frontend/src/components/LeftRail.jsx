import { Link, useLocation } from "react-router-dom";
import { useFilters } from "../context/FiltersContext.jsx";

export default function LeftRail({
  infraCount,
  parentOrgCount,
  onOpenFilters,
  onSwitchView,
  viewLabel = "Technology & Capability"
}) {
  const { activeCount } = useFilters();
  const loc = useLocation();

  const tabClass = (path) =>
    loc.pathname === path
      ? "bg-blue-700 text-white"
      : "bg-blue-100 text-blue-800 hover:bg-blue-200";

  return (
    <div className="w-[280px] shrink-0">
      {/* Title + presented by */}
      <div className="mb-6">
        <h1 className="text-5xl font-extrabold text-blue-300 leading-none">
          AI Tools
        </h1>
        <div className="text-xs text-blue-700 mt-2 flex items-center gap-2">
          <span>presented by</span>
          <a
            href="https://me-dmz.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline hover:text-blue-900"
          >
            ME-DMZ
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="space-y-4">
        <KpiPill value={infraCount} label="Infra Count" />
        <KpiPill value={parentOrgCount} label="Parent Org Count" />
      </div>

      {/* Buttons */}
      <div className="mt-6 space-y-3">
        <button
          onClick={onOpenFilters}
          className="w-full rounded-2xl px-5 py-4 text-left bg-blue-200 hover:bg-blue-300 flex items-center justify-between shadow-sm"
        >
          <span className="font-semibold text-blue-950 text-lg">Filter</span>
          <span className="bg-blue-700 text-white text-xs px-2 py-1 rounded-full">
            {activeCount}
          </span>
        </button>

        <button
          onClick={onSwitchView}
          className="w-full rounded-2xl px-5 py-4 text-left bg-blue-100 hover:bg-blue-200 shadow-sm"
        >
          <div className="text-sm text-blue-700 mb-1">Current view</div>
          <div className="font-semibold text-blue-950">{viewLabel}</div>
          <div className="text-xs text-blue-700 mt-1 underline">Switch View</div>
        </button>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2">
          <Link to="/details" className={`text-center rounded-lg py-2 text-sm ${tabClass("/details")}`}>
            Details
          </Link>
          <Link to="/overview" className={`text-center rounded-lg py-2 text-sm ${tabClass("/overview")}`}>
            Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

function KpiPill({ value, label }) {
  return (
    <div className="rounded-2xl border-2 border-blue-900 px-5 py-5 bg-white">
      <div className="text-3xl font-bold text-blue-950 text-center">{value}</div>
      <div className="text-xs text-blue-950/80 mt-1 text-center">{label}</div>
    </div>
  );
}
