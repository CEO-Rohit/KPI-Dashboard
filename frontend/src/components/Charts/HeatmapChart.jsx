export default function HeatmapChart({ data = [], title = "", xLabels = [], yLabels = [], maxVal = 30, valuePrefix = "$", small = false }) {
  const getColor = (value) => {
    const ratio = Math.min(value / maxVal, 1);
    if (ratio < 0.2) return "rgba(99, 102, 241, 0.15)";
    if (ratio < 0.4) return "rgba(99, 102, 241, 0.3)";
    if (ratio < 0.6) return "rgba(99, 102, 241, 0.5)";
    if (ratio < 0.8) return "rgba(99, 102, 241, 0.7)";
    return "rgba(99, 102, 241, 0.9)";
  };

  const cellSize = small ? "28px" : "36px";

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${xLabels.length}, 1fr)`, gap: "2px", minWidth: xLabels.length > 8 ? "600px" : "auto" }}>
          {/* Header row */}
          <div className="heatmap-label" />
          {xLabels.map((l, i) => (
            <div key={i} className="heatmap-label" style={{ justifyContent: "center", fontSize: "10px" }}>{l}</div>
          ))}
          {/* Data rows */}
          {yLabels.map((yLabel, yi) => (
            <>
              <div key={`y-${yi}`} className="heatmap-label" style={{ fontSize: "11px" }}>{yLabel}</div>
              {xLabels.map((_, xi) => {
                const cell = data.find(d => d.row === yi && d.col === xi);
                const val = cell?.value || 0;
                return (
                  <div key={`${yi}-${xi}`} className="heatmap-cell"
                    style={{ background: getColor(val), minHeight: cellSize, fontSize: small ? "9px" : "11px" }}
                    title={`${yLabel} ${xLabels[xi]}: ${valuePrefix}${val}`}>
                    {!small && val > 0 ? val : ""}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
