import { useState } from "react";
import { api } from "../api";

const EMPTY = { name: "", set_number: "", theme: "", piece_count: "", status: "wishlist", notes: "" };

export default function SetFormModal({ set, onClose, onSaved }) {
  const editing = Boolean(set);
  const [form, setForm] = useState(
    set
      ? {
          name: set.name || "",
          set_number: set.set_number || "",
          theme: set.theme || "",
          piece_count: set.piece_count ?? "",
          status: set.status || "wishlist",
          notes: set.notes || "",
        }
      : EMPTY
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async () => {
    setError("");
    setSaving(true);
    try {
      if (editing) await api.updateSet(set.id, form);
      else await api.addSet(form);
      onSaved();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{editing ? "Edit set" : "Add a set"}</h2>

        <label className="field-label">Name</label>
        <input className="input" value={form.name} onChange={update("name")} placeholder="Millennium Falcon" />

        <div className="field-row">
          <div>
            <label className="field-label">Set number</label>
            <input className="input" value={form.set_number} onChange={update("set_number")} placeholder="75192" />
          </div>
          <div>
            <label className="field-label">Pieces</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.piece_count}
              onChange={update("piece_count")}
              placeholder="7541"
            />
          </div>
        </div>

        <div className="field-row">
          <div>
            <label className="field-label">Theme</label>
            <input className="input" value={form.theme} onChange={update("theme")} placeholder="Star Wars" />
          </div>
          <div>
            <label className="field-label">Status</label>
            <select className="input" value={form.status} onChange={update("status")}>
              <option value="owned">Owned</option>
              <option value="building">Building</option>
              <option value="wishlist">Wishlist</option>
            </select>
          </div>
        </div>

        <label className="field-label">Notes</label>
        <textarea className="input textarea" value={form.notes} onChange={update("notes")} rows={2} />

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add set"}
          </button>
        </div>
      </div>
    </div>
  );
}
