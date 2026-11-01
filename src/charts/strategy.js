function renderStrategy(data) {
  const drivers = data.results
    .filter((r) => r.position !== null)
    .sort((a, b) => a.position - b.position)
    .map((r) => r.driver);

  const shapes = [];
  const annotations = [];

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
