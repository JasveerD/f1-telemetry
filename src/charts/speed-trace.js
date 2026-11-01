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
