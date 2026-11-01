const AVAILABLE_SESSIONS = {};

async function loadIndex() {
  try {
    const resp = await fetch("../data/index.json");
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
