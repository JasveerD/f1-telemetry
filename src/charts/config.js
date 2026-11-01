const PLOTLY_LAYOUT = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "#0f0f13",
  font: { family: "Inter, system-ui, sans-serif", color: "#e8e8ed", size: 12 },
  margin: { l: 50, r: 20, t: 10, b: 40 },
  xaxis: { gridcolor: "#2a2a3a", zerolinecolor: "#2a2a3a" },
  yaxis: { gridcolor: "#2a2a3a", zerolinecolor: "#2a2a3a" },
  legend: { orientation: "h", y: -0.15 },
  hovermode: "x unified",
};

const PLOTLY_CONFIG = {
  responsive: true,
  displayModeBar: true,
  modeBarButtonsToRemove: ["lasso2d", "select2d"],
};

const COMPOUND_COLORS = {
  SOFT: "#ffd700",
  MEDIUM: "#ffaa00",
  HARD: "#ffffff",
  INTERMEDIATE: "#00cc44",
  WET: "#0088ff",
};

function getDriverColor(results, driver) {
  const entry = results.find((r) => r.driver === driver);
  return entry?.team_color || "#888888";
}
