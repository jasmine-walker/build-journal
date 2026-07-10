// Computes at-a-glance numbers from the full collection: total sets, total
// pieces, and how many are in each status.
export default function StatsStrip({ sets }) {
  const totalSets = sets.length;
  const totalPieces = sets.reduce((sum, s) => sum + (s.piece_count || 0), 0);
  const byStatus = { owned: 0, building: 0, wishlist: 0 };
  for (const s of sets) byStatus[s.status] = (byStatus[s.status] || 0) + 1;

  const stat = (label, value, tone) => (
    <div className="stat">
      <div className={`stat-value tone-${tone}`}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );

  return (
    <div className="stats">
      {stat("Sets", totalSets, "b")}
      {stat("Pieces", totalPieces.toLocaleString(), "b")}
      {stat("Owned", byStatus.owned, "g")}
      {stat("Building", byStatus.building, "o")}
      {stat("Wishlist", byStatus.wishlist, "b")}
    </div>
  );
}
