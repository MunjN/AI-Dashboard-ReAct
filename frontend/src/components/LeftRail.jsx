import { Link, useLocation } from "react-router-dom";

export default function LeftRail({ onOpenFilters, onOpenBookmarks }) {
  const location = useLocation();
  const path = location.pathname;

  const navItem = (to, label) => {
    const active = path === to;
    return (
      <Link
        to={to}
        className={`
          w-full px-4 py-3 rounded-xl text-left font-semibold transition
          ${active ? "bg-white text-blue-950 shadow" : "text-white/90 hover:bg-white/20"}
        `}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside
      className="
        w-[240px] shrink-0 h-screen sticky top-0
        bg-[#1d186d] text-white
        flex flex-col p-4 gap-4
      "
    >
      {/* Brand */}
      <div className="mb-2">
        <a href="https://me-dmz.com" target="_blank" rel="noreferrer">
          <div className="text-xl font-bold tracking-wide">ME-DMZ</div>
          <div className="text-xs opacity-80">AI Tools Dashboard</div>
        </a>
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-2">
        {navItem("/details", "Details")}
        {navItem("/overview", "Overview")}
      </div>

      {/* Primary actions */}
      <div className="mt-2 flex flex-col gap-2">
        <button
          onClick={onOpenFilters}
          className="
            w-full px-4 py-3 rounded-xl font-semibold text-left
            bg-white/10 hover:bg-white/20 transition
          "
        >
          🧪 Filters
        </button>

        <button
          onClick={onOpenBookmarks}
          className="
            w-full px-4 py-3 rounded-xl font-semibold text-left
            bg-white/10 hover:bg-white/20 transition
          "
        >
          ⭐ Bookmarks
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="text-xs opacity-70">
        Presented by ME-DMZ
      </div>
    </aside>
  );
}
