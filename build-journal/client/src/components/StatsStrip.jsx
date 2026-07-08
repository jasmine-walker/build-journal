// Computes at-a-glance numbers from the full collection: total sets, total
// pieces, and how many are in each status.
export default function StatsStrip({ sets }) {
  const totalSets = sets.length;
  const totalPieces = sets.reduce((sum, s) => sum + (s.piece_count || 0), 0);
  const byStatus = { owned: 0, building: 0, wishlist: 0 };
  for (const s of sets) byStatus[s.status] = (byStatus[s.status] || 0) + 1;

  const stat = (label, value) => (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );

  return (
    <div className="stats">
      {stat("Sets", totalSets)}
      {stat("Pieces", totalPieces.toLocaleString())}
      {stat("Owned", byStatus.owned)}
      {stat("Building", byStatus.building)}
      {stat("Wishlist", byStatus.wishlist)}
    </div>
  );
}
