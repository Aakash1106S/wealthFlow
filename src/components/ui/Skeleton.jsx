export function Skeleton({ className = '', style = {} }) {
  return (
    <div className="shimmer" style={{ borderRadius: 8, ...style }} />
  );
}

export function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <Skeleton style={{ height: 10, width: 80 }} />
        <Skeleton style={{ width: 28, height: 28, borderRadius: 7 }} />
      </div>
      <Skeleton style={{ height: 22, width: 100, marginTop: 4 }} />
      <Skeleton style={{ height: 10, width: 60, marginTop: 4 }} />
    </div>
  );
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="txn-row">
          <Skeleton style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skeleton style={{ height: 12, width: 120, marginBottom: 6 }} />
            <Skeleton style={{ height: 10, width: 80 }} />
          </div>
          <Skeleton style={{ height: 12, width: 60 }} />
        </div>
      ))}
    </div>
  );
}
