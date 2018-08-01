
const renderChart = (data) => {
  var palette = new Rickshaw.Color.Palette();


  let graph = new Rickshaw.Graph({
    element: document.querySelector("#chart"),
    width: document.width,
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
        color: '#5677FC',
        data: getData('to'),
        color: palette.color()
      }
    ]
  });

  let hoverDetail = new Rickshaw.Graph.HoverDetail({ graph: graph });
  var x_axis = new Rickshaw.Graph.Axis.Time( { graph: graph } );

  var y_axis = new Rickshaw.Graph.Axis.Y( {
          graph: graph,
          orientation: 'left',
          tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
          element: document.getElementById('y_axis'),
  } );

  var legend = new Rickshaw.Graph.Legend( {
    element: document.querySelector('#legend'),
    graph: graph
} );

  
  graph.render();
}
