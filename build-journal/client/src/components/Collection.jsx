import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import StatsStrip from "./StatsStrip.jsx";
import Toolbar from "./Toolbar.jsx";
import SetGrid from "./SetGrid.jsx";
import SetFormModal from "./SetFormModal.jsx";
import AiPanel from "./AiPanel.jsx";

function EmptyState({ onAdd }) {
  return (
    <div className="empty">
      <p className="empty-title">Your journal is empty</p>
      <p className="muted">Add your first LEGO set to get started.</p>
      <button className="btn btn-primary" onClick={onAdd}>
        + Add a set
      </button>
    </div>
  );
}

export default function Collection() {
  const [sets, setSets] = useState([]); // filtered list for the grid
  const [allSets, setAllSets] = useState([]); // full list for the stats strip
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Grid data: filtered and sorted by the API so search/sort are real,
  // server-side operations, not client-side fakes.
  const loadGrid = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      if (sort) params.set("sort", sort);
      const { sets } = await api.listSets(params.toString());
      setSets(sets);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, status, sort]);

  // Stats always reflect the whole collection, so we fetch it unfiltered.
  const loadStats = useCallback(async () => {
    try {
      const { sets } = await api.listSets("");
      setAllSets(sets);
    } catch {
      /* stats are non-critical; ignore */
    }
  }, []);

  // Debounce so typing in search doesn't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(loadGrid, 250);
    return () => clearTimeout(id);
  }, [loadGrid]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refresh = () => {
    loadGrid();
    loadStats();
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (set) => {
    setEditing(set);
    setFormOpen(true);
  };
  const handleSaved = () => {
    setFormOpen(false);
    setEditing(null);
    refresh();
  };
  const handleDelete = async (id) => {
    try {
      await api.deleteSet(id);
      refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <StatsStrip sets={allSets} />
      <AiPanel />
      <Toolbar
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        sort={sort}
        onSort={setSort}
        onAdd={openAdd}
      />
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading your collection…</p>
      ) : sets.length ? (
        <SetGrid sets={sets} onEdit={openEdit} onDelete={handleDelete} />
      ) : allSets.length ? (
        <p className="muted">No sets match your filters.</p>
      ) : (
        <EmptyState onAdd={openAdd} />
      )}
      {formOpen && (
        <SetFormModal set={editing} onClose={() => setFormOpen(false)} onSaved={handleSaved} />
      )}
    </>
  );
}
