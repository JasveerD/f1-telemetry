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
