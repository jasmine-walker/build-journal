import { Boxes, Layers, Check, Wrench, Star } from "lucide-react";

const TONE = { b: "#1A6DD5", g: "#3EA33F", o: "#F57C20" };

export default function StatsStrip({ sets }) {
  const totalSets = sets.length;
  const totalPieces = sets.reduce((sum, s) => sum + (s.piece_count || 0), 0);
  const byStatus = { owned: 0, building: 0, wishlist: 0 };
  for (const s of sets) byStatus[s.status] = (byStatus[s.status] || 0) + 1;

  const stat = (Icon, label, value, tone) => (
    <div className="stat">
      <div className="stat-top">
        <Icon size={15} strokeWidth={2.5} style={{ color: TONE[tone] }} />
        <div className={`stat-value tone-${tone}`}>{value}</div>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );

  return (
    <div className="stats">
      {stat(Boxes, "Sets", totalSets, "b")}
      {stat(Layers, "Pieces", totalPieces.toLocaleString(), "b")}
      {stat(Check, "Owned", byStatus.owned, "g")}
      {stat(Wrench, "Building", byStatus.building, "o")}
      {stat(Star, "Wishlist", byStatus.wishlist, "b")}
    </div>
  );
}
