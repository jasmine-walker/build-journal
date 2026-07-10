import { Search, Plus } from "lucide-react";

const STATUSES = ["all", "owned", "building", "wishlist"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name" },
  { value: "pieces", label: "Pieces" },
  { value: "theme", label: "Theme" },
];

export default function Toolbar({ search, onSearch, status, onStatus, sort, onSort, onAdd }) {
  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="input search"
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <select className="input select" value={sort} onChange={(e) => onSort(e.target.value)}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>Sort: {s.label}</option>
          ))}
        </select>
        <button className="btn btn-green add-btn" onClick={onAdd}>
          <Plus size={16} strokeWidth={2.5} /> Add set
        </button>
      </div>
      <div className="tabs">
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`tab ${status === s ? "tab-active" : ""}`}
            onClick={() => onStatus(s)}
          >
            {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
