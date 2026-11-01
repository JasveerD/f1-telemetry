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
  const url = `../data/${year}/${gp}/${session}.json`;
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
