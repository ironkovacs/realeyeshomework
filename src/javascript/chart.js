const renderChart = () => {

  chartContainer.innerHTML = '<div id="y_axis"></div><div id="chart"></div></div><div id="legend"></div>'
  const palette = new Rickshaw.Color.Palette();
  const graph = new Rickshaw.Graph({
    element: document.querySelector('#chart'),
    width: document.querySelector('.exchange').offsetWidth - document.querySelector('#y_axis').offsetWidth,
    height: 250,
    renderer: 'line',
    series: [
      {
        name: `EUR - ${activeCurrencies.from.currency}`,
        data: getData('from'),
        color: palette.color()
      },
      {
        name: `EUR - ${activeCurrencies.to.currency}`,
        data: getData('to'),
        color: palette.color()
      },
      {
        name: `${activeCurrencies.from.currency} - ${activeCurrencies.to.currency}`,
        data: getData('exc'),
        color: palette.color()
      },

    ]
  });

  let hoverDetail = new Rickshaw.Graph.HoverDetail({ graph: graph });
  let x_axis = new Rickshaw.Graph.Axis.Time({ graph: graph });

  let y_axis = new Rickshaw.Graph.Axis.Y({
    graph: graph,
    orientation: 'left',
    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    element: document.querySelector('#y_axis'),
  });

  let legend = new Rickshaw.Graph.Legend({
    element: document.querySelector('#legend'),
    graph: graph
  });

  graph.render();
}
