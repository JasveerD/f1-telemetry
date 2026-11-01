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
