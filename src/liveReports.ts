async function toggleCoinDataFetch(): Promise<
  {
    coinName: string;
    date: Date;
    values: { USD: number; EUR: number; ILS: number };
  }[]
> {
  const toggleArrayCoin: string[] = getToggleArrayFromLocalStorage();

  const idCoin = await fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${toggleArrayCoin}&tsyms=USD,EUR,ILS`
  );

  const data = await idCoin.json();

  const extractedData: {
    coinName: string;
    date: Date;
    values: { USD: number; EUR: number; ILS: number };
  }[] = [];
  Object.entries(data).forEach((coinEntry) =>
    extractedData.push({
      coinName: coinEntry[0],
      date: new Date(),
      values: coinEntry[1] as { USD: number; EUR: number; ILS: number },
    })
  );
  return extractedData;
}

window.onload = async function () {
  var chart = new CanvasJS.Chart("chartContainer", {
    title: {
      text: "Coin Data",
    },
    axisY: {
      prefix: "₪ ",
    },
    data: [],
  });

  const updateChartData = async () => {
    var chartData = await toggleCoinDataFetch();

    chart.options.data = chartData.map((coin) => ({
      type: "column",
      name: coin.coinName,
      showInLegend: true,
      toolTip: {
        enabled: true,
      },
      dataPoints: Object.entries(coin.values).map(([currency, value]) => ({
        x: coin.date,
        y: coin.values["ILS"],
        toolTipContent: `USD: ${coin.values.USD}<br/>EUR: ${coin.values.EUR}<br/>ILS: ${coin.values.ILS}`,
      })),
    }));
    chart.render();
  };

  updateChartData();
  setInterval(updateChartData, 10000);
};
