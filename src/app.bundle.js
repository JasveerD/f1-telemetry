/* === Config === */
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

/* === Lap Times Chart === */
function renderLapTimes(data, selectedDrivers) {
  const traces = selectedDrivers.map((drv) => {
    const driverLaps = data.laps.filter(
      (l) => l.driver === drv && l.lap_time_s !== null
    );
    return {
      x: driverLaps.map((l) => l.lap_number),
      y: driverLaps.map((l) => l.lap_time_s),
      mode: "lines+markers",
      name: drv,
      line: { color: getDriverColor(data.results, drv), width: 2 },
      marker: {
        size: 4,
        color: driverLaps.map((l) => COMPOUND_COLORS[l.compound] || "#888"),
      },
      hovertemplate: "%{y:.3f}s<extra>%{fullData.name} Lap %{x}</extra>",
    };
  });

  const layout = {
    ...PLOTLY_LAYOUT,
    xaxis: { ...PLOTLY_LAYOUT.xaxis, title: "Lap" },
    yaxis: { ...PLOTLY_LAYOUT.yaxis, title: "Lap Time (s)", autorange: "reversed" },
  };

  Plotly.react("lap-times-chart", traces, layout, PLOTLY_CONFIG);
}

/* === Speed Trace === */
function renderSpeedTrace(data, selectedDrivers) {
  const traces = selectedDrivers
    .filter((drv) => data.telemetry[drv])
    .map((drv) => {
      const tel = data.telemetry[drv];
      return {
        x: tel.distance,
        y: tel.speed,
        mode: "lines",
        name: `${drv} (${tel.lap_time_s?.toFixed(3) || "—"}s)`,
        line: { color: getDriverColor(data.results, drv), width: 2 },
        hovertemplate: "%{y:.0f} km/h<extra>%{fullData.name}</extra>",
      };
    });

  const layout = {
    ...PLOTLY_LAYOUT,
    xaxis: { ...PLOTLY_LAYOUT.xaxis, title: "Distance (m)" },
    yaxis: { ...PLOTLY_LAYOUT.yaxis, title: "Speed (km/h)" },
  };

  Plotly.react("speed-trace-chart", traces, layout, PLOTLY_CONFIG);
}

/* === Telemetry (Throttle / Brake / Gear) === */
function renderTelemetry(data, selectedDrivers) {
  const drivers = selectedDrivers.filter((drv) => data.telemetry[drv]);

  function makeTraces(field, unit) {
    return drivers.map((drv) => {
      const tel = data.telemetry[drv];
      return {
        x: tel.distance,
        y: tel[field],
        mode: "lines",
        name: drv,
        line: { color: getDriverColor(data.results, drv), width: 1.5 },
        hovertemplate: `%{y:.0f} ${unit}<extra>${drv}</extra>`,
      };
    });
  }

  const baseLayout = {
    ...PLOTLY_LAYOUT,
    height: 200,
    xaxis: { ...PLOTLY_LAYOUT.xaxis, title: "" },
    showlegend: false,
  };

  Plotly.react(
    "throttle-chart",
    makeTraces("throttle", "%"),
    { ...baseLayout, yaxis: { ...PLOTLY_LAYOUT.yaxis, title: "Throttle %" } },
    PLOTLY_CONFIG
  );

  Plotly.react(
    "brake-chart",
    makeTraces("brake", ""),
    { ...baseLayout, yaxis: { ...PLOTLY_LAYOUT.yaxis, title: "Brake" } },
    PLOTLY_CONFIG
  );

  Plotly.react(
    "gear-chart",
    makeTraces("gear", ""),
    {
      ...baseLayout,
      xaxis: { ...PLOTLY_LAYOUT.xaxis, title: "Distance (m)" },
      yaxis: { ...PLOTLY_LAYOUT.yaxis, title: "Gear", dtick: 1 },
    },
    PLOTLY_CONFIG
  );
}

/* === Tire Strategy === */
function renderStrategy(data) {
  const drivers = data.results
    .filter((r) => r.position !== null)
    .sort((a, b) => a.position - b.position)
    .map((r) => r.driver);

  const shapes = [];

  drivers.forEach((drv, i) => {
    const driverLaps = data.laps.filter((l) => l.driver === drv);
    const stints = [];
    let currentStint = null;

    driverLaps.forEach((lap) => {
      if (!currentStint || currentStint.stint !== lap.stint) {
        if (currentStint) stints.push(currentStint);
        currentStint = {
          stint: lap.stint,
          compound: lap.compound,
          start: lap.lap_number,
          end: lap.lap_number,
        };
      } else {
        currentStint.end = lap.lap_number;
      }
    });
    if (currentStint) stints.push(currentStint);

    stints.forEach((stint) => {
      shapes.push({
        type: "rect",
        x0: stint.start - 0.5,
        x1: stint.end + 0.5,
        y0: i - 0.4,
        y1: i + 0.4,
        fillcolor: COMPOUND_COLORS[stint.compound] || "#888",
        opacity: 0.8,
        line: { width: 0 },
      });
    });
  });

  const layout = {
    ...PLOTLY_LAYOUT,
    height: Math.max(400, drivers.length * 24),
    shapes,
    xaxis: { ...PLOTLY_LAYOUT.xaxis, title: "Lap" },
    yaxis: {
      ...PLOTLY_LAYOUT.yaxis,
      tickvals: drivers.map((_, i) => i),
      ticktext: drivers,
      autorange: "reversed",
    },
  };

  Plotly.react("strategy-chart", [{ x: [], y: [], type: "scatter" }], layout, PLOTLY_CONFIG);
}

/* === Picker === */
async function loadIndex() {
  try {
    const resp = await fetch("data/index.json");
    const index = await resp.json();
    return index;
  } catch {
    return {};
  }
}

function populateYears(index) {
  const yearSelect = document.getElementById("year-select");
  const years = Object.keys(index).sort().reverse();
  yearSelect.innerHTML = years
    .map((y) => `<option value="${y}">${y}</option>`)
    .join("");
  return years[0];
}

function populateGPs(index, year) {
  const gpSelect = document.getElementById("gp-select");
  const gps = Object.keys(index[year] || {}).sort();
  gpSelect.innerHTML = gps
    .map((gp) => `<option value="${gp}">${gp.replace(/-/g, " ")}</option>`)
    .join("");
  return gps[0];
}

function populateSessions(index, year, gp) {
  const sessionSelect = document.getElementById("session-select");
  const sessions = index[year]?.[gp] || [];
  sessionSelect.innerHTML = sessions
    .map((s) => `<option value="${s}">${s}</option>`)
    .join("");
}

/* === Driver Selector === */
let selectedDrivers = [];

function renderDriverChips(results, onChange) {
  const container = document.getElementById("driver-chips");
  container.innerHTML = "";
  selectedDrivers = results.slice(0, 4).map((r) => r.driver);

  results.forEach((r) => {
    const chip = document.createElement("div");
    chip.className = "driver-chip";
    chip.textContent = r.driver;
    chip.style.color = r.team_color || "#888";
    chip.style.backgroundColor = (r.team_color || "#888") + "20";

    if (selectedDrivers.includes(r.driver)) {
      chip.classList.add("selected");
    }

    chip.addEventListener("click", () => {
      if (selectedDrivers.includes(r.driver)) {
        selectedDrivers = selectedDrivers.filter((d) => d !== r.driver);
        chip.classList.remove("selected");
      } else {
        selectedDrivers.push(r.driver);
        chip.classList.add("selected");
      }
      onChange(selectedDrivers);
    });

    container.appendChild(chip);
  });
}

/* === App === */
let sessionData = null;

function showSections() {
  document.querySelectorAll(".card.hidden").forEach((el) => el.classList.remove("hidden"));
}

function updateCharts(drivers) {
  if (!sessionData) return;
  renderLapTimes(sessionData, drivers);
  renderSpeedTrace(sessionData, drivers);
  renderTelemetry(sessionData, drivers);
  renderStrategy(sessionData);
}

async function loadSession(year, gp, session) {
  const url = `data/${year}/${gp}/${session}.json`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`No data found (${resp.status})`);
    sessionData = await resp.json();

    renderDriverChips(sessionData.results, updateCharts);
    showSections();
    updateCharts(selectedDrivers);
  } catch (err) {
    alert(`Could not load session: ${err.message}\n\nRun the fetch script first:\npython scripts/fetch_session.py --year ${year} --gp ${gp} --session R`);
  }
}

async function init() {
  const index = await loadIndex();
  const years = Object.keys(index);

  if (years.length === 0) {
    document.querySelector("#session-picker h2").textContent =
      "No data yet — run the Python fetch script to add sessions";
    return;
  }

  const year = populateYears(index);
  const gp = populateGPs(index, year);
  populateSessions(index, year, gp);

  document.getElementById("year-select").addEventListener("change", (e) => {
    const gp = populateGPs(index, e.target.value);
    populateSessions(index, e.target.value, gp);
  });

  document.getElementById("gp-select").addEventListener("change", (e) => {
    populateSessions(index, document.getElementById("year-select").value, e.target.value);
  });

  document.getElementById("load-btn").addEventListener("click", () => {
    const y = document.getElementById("year-select").value;
    const g = document.getElementById("gp-select").value;
    const s = document.getElementById("session-select").value;
    loadSession(y, g, s);
  });
}

init();
