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
