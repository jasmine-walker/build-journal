import { Check, Wrench, Star } from "lucide-react";

const STATUS_ICON = { owned: Check, building: Wrench, wishlist: Star };

function StatusBadge({ status }) {
  const Icon = STATUS_ICON[status];
  return (
    <span className={`badge badge-${status}`}>
      <Icon size={12} strokeWidth={2.5} />
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}

function SetCard({ set, onEdit, onDelete, readOnly, index }) {
  const meta = [set.theme, set.piece_count ? `${set.piece_count.toLocaleString()} pcs` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={`card card-${set.status}`} style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}>
      <div className="card-studs">
        <span className="card-stud" />
        <span className="card-stud" />
      </div>
      <div className="card-top">
        <p className="card-name">{set.name}</p>
        {set.set_number && <span className="card-number">#{set.set_number}</span>}
      </div>
      <p className="card-meta">{meta || "—"}</p>
      <div className="card-bottom">
        <StatusBadge status={set.status} />
        {!readOnly && (
          <div className="card-actions">
            <button className="link-btn" onClick={() => onEdit(set)}>Edit</button>
            <button className="link-btn danger" onClick={() => onDelete(set.id)}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SetGrid({ sets, onEdit, onDelete, readOnly }) {
  return (
    <div className="grid">
      {sets.map((set, i) => (
        <SetCard
          key={set.id}
          set={set}
          index={i}
          onEdit={onEdit}
          onDelete={onDelete}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
