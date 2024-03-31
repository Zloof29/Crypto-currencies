class CryptoCoinsInfo {
  id: string;
  image: {
    thumb: string;
  };
  market_data: {
    current_price: {
      usd: number;
      eur: number;
      ils: number;
    };
  };

  constructor(
    id: string,
    image: { thumb: string },
    market_data: { current_price: { usd: number; eur: number; ils: number } }
  ) {
    this.image = image;
    this.market_data = market_data;
    this.id = id;
  }
}

class CryptoCoins {
  id: string;
  name: string;
  symbol: string;

  constructor(id: string, name: string, symbol: string) {
    this.id = id;
    this.name = name;
    this.symbol = symbol;
  }
}

(async function (): Promise<void> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/list`);
    const coinData = await response.json();

    display100Coins(coinData);
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error;
  }
})();

async function getInfoFromApiById(id: string): Promise<CryptoCoinsInfo> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}`
    );
    const idCoinData = await response.json();

    if (!isDataAlreadySaved(idCoinData)) {
      saveInlocalStorage(idCoinData);
    }

    return idCoinData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

function isDataAlreadySaved(idCoinData: CryptoCoinsInfo): boolean {
  const coinDataArray: CryptoCoinsInfo[] = JSON.parse(
    localStorage.getItem(`coinDataArray`) || "[]"
  );

  return coinDataArray.some((coinData) => coinData.id === idCoinData.id);
}

function saveInlocalStorage(idCoinData: CryptoCoinsInfo): void {
  const coinDataArray: CryptoCoinsInfo[] = JSON.parse(
    localStorage.getItem(`coinDataArray`) || "[]"
  );

  coinDataArray.push(idCoinData);

  localStorage.setItem(`coinDataArray`, JSON.stringify(coinDataArray));
}

function getFirst100Coins(coinData: []): CryptoCoins[] {
  const arrayOfCoins: CryptoCoins[] = [];

  for (let i = 0; i < 100; i++) {
    arrayOfCoins.push(coinData[i]);
  }

  return arrayOfCoins;
}

function processCoins(arrayOfCoins: CryptoCoins[]): void {
  createCardInHtml(arrayOfCoins);
  mainSpinner();
  updateToggleStatesOnLoad(arrayOfCoins);
  countToggleButtons();
  resetSearch(arrayOfCoins);
}

function display100Coins(coinData: []): void {
  const arrayOfCoins = getFirst100Coins(coinData);
  processCoins(arrayOfCoins);
}

function mainSpinner(): void {
  const loading = document.querySelector(".spinner-border") as HTMLDivElement;
  if (loading) {
    loading.style.display = "none";
  }
}

function createCardElements(
  coin: CryptoCoins,
  index: number,
  arrayOfCoins: CryptoCoins[]
) {
  const cardDiv = createCard();
  const cardBodyDiv = createCardBody();
  const cardTitle = createCardTitle(coin);
  const cardText = createCardText(coin);
  const toggleInput = createToggleInput(index, coin, arrayOfCoins);
  const moreInfoButton = createMoreInfoButton(index);
  const infoContainer = document.createElement(`div`);
  infoContainer.id = `collapseExampleContent${index}`;

  return {
    cardDiv,
    cardBodyDiv,
    cardTitle,
    cardText,
    toggleInput,
    moreInfoButton,
    infoContainer,
  };
}

function appendCardElements(elements: any, cardBodyDiv: HTMLDivElement) {
  cardBodyDiv.appendChild(elements.cardTitle);
  cardBodyDiv.appendChild(elements.cardText);
  cardBodyDiv.appendChild(elements.toggleInput);
  cardBodyDiv.appendChild(elements.moreInfoButton);
  cardBodyDiv.appendChild(elements.infoContainer);
}

function setupCardEvents(
  elements: any,
  coin: CryptoCoins,
  index: number,
  arrayOfCoins: CryptoCoins[]
) {
  searchCoin(arrayOfCoins);
  moreInfoButtonWithEventListener(index, coin, elements.moreInfoButton);
}

function createCardInHtml(arrayOfCoins: CryptoCoins[]): void {
  const cardsRow = document.querySelector(`#card`) as HTMLDivElement;

  arrayOfCoins.forEach((coin, index) => {
    const elements = createCardElements(coin, index, arrayOfCoins);
    cardsRow.appendChild(elements.cardDiv);
    elements.cardDiv.appendChild(elements.cardBodyDiv);
    appendCardElements(elements, elements.cardBodyDiv);
    setupCardEvents(elements, coin, index, arrayOfCoins);
  });
}

async function addSpinnerToContainer(index: number): Promise<HTMLDivElement> {
  const spinner = createSpinnerForCollapse();
  const infoContainer = document.querySelector(
    `#collapseExampleContent${index}`
  ) as HTMLDivElement;
  infoContainer.appendChild(spinner);
  return spinner;
}

function removeSpinnerFromContainer(spinner: HTMLDivElement): void {
  spinner.remove();
}

async function fetchCoinData(coinId: string): Promise<CryptoCoinsInfo> {
  const idCoinData = await getInfoFromApiById(coinId);
  return idCoinData;
}

async function moreInfoButtonWithEventListener(
  index: number,
  coin: CryptoCoins,
  moreInfoButton: HTMLButtonElement
): Promise<void> {
  moreInfoButton.addEventListener(`click`, async function (): Promise<void> {
    try {
      const spinner = await addSpinnerToContainer(index);
      const idCoinData = await fetchCoinData(coin.id);
      removeSpinnerFromContainer(spinner);
      collapseButton(idCoinData, index);
    } catch (error) {
      console.error(`Error: ${error}`);
      throw error;
    }
  });
}

function createCard(): HTMLDivElement {
  const cardDiv = document.createElement(`div`) as HTMLDivElement;
  cardDiv.classList.add(`card`, `col-md-4`);
  return cardDiv;
}

function createCardBody(): HTMLDivElement {
  const cardBodyDiv = document.createElement(`div`) as HTMLDivElement;
  cardBodyDiv.classList.add(`card-body`);
  return cardBodyDiv;
}

function createCardTitle(coin: CryptoCoins): HTMLDivElement {
  const divTitle = document.createElement(`h5`) as HTMLHeadingElement;
  divTitle.classList.add(`card-title`);
  divTitle.id = `symbolCoin`;
  divTitle.textContent = coin.symbol;
  return divTitle;
}

function createCardText(coin: CryptoCoins): HTMLDivElement {
  const cardTextDiv = document.createElement(`p`) as HTMLParagraphElement;
  cardTextDiv.classList.add(`card-text`);
  cardTextDiv.textContent = coin.name;
  return cardTextDiv;
}

function getToggleArrayFromLocalStorage(): string[] {
  return JSON.parse(localStorage.getItem("toggleInput") || "[]");
}

function saveToggleArrayToLocalStorage(toggleArray: string[]): void {
  localStorage.setItem("toggleInput", JSON.stringify(toggleArray));
}

function handleToggleChecked(
  toggleInput: HTMLInputElement,
  coin: CryptoCoins,
  arrayOfCoins: CryptoCoins[],
  toggleArray: string[]
): void {
  if (toggleArray.length < 6 && !toggleArray.includes(coin.id)) {
    toggleArray.push(coin.id);
    saveToggleArrayToLocalStorage(toggleArray);
    modalBody(arrayOfCoins);
  } else {
    toggleInput.checked = false;
  }
}

function handleToggleUnchecked(
  coin: CryptoCoins,
  arrayOfCoins: CryptoCoins[],
  toggleArray: string[]
): void {
  toggleArray = toggleArray.filter((id) => id !== coin.id);
  saveToggleArrayToLocalStorage(toggleArray);
  modalBody(arrayOfCoins);
}

function saveToggleStateInLocalStorage(
  toggleInput: HTMLInputElement,
  coin: CryptoCoins,
  arrayOfCoins: CryptoCoins[]
): void {
  let toggleArray: string[] = getToggleArrayFromLocalStorage();

  if (toggleInput.checked) {
    handleToggleChecked(toggleInput, coin, arrayOfCoins, toggleArray);
  } else {
    handleToggleUnchecked(coin, arrayOfCoins, toggleArray);
  }
}

function updateToggleStatesOnLoad(arrayOfCoins: CryptoCoins[]): void {
  const toggleArray: string[] = JSON.parse(
    localStorage.getItem(`toggleInput`) || "[]"
  );

  arrayOfCoins.forEach((coin, index) => {
    const toggleInput = document.querySelector(
      `#toggleInput${index}`
    ) as HTMLInputElement;

    if (toggleArray.includes(coin.id)) {
      toggleInput.checked = true;
    } else {
      toggleInput.checked = false;
    }
  });
}

function countCheckedToggleButtons(): {
  count: number;
  checkedButtons: HTMLInputElement[];
} {
  const allToggleButtons = document.querySelectorAll(
    ".form-check-input"
  ) as NodeListOf<HTMLInputElement>;
  const toggleInputChecked: HTMLInputElement[] = [];
  let toggleButtonCounter = 0;

  allToggleButtons.forEach((toggleButton) => {
    if (toggleButton.checked) {
      toggleButtonCounter++;
      toggleInputChecked.push(toggleButton);
    }
  });

  return { count: toggleButtonCounter, checkedButtons: toggleInputChecked };
}

function handleModalDisplay(count: number): void {
  const displayModal = new bootstrap.Modal(".modal") as bootstrap.Modal;

  if (count > 5) {
    displayModal.show();
  } else {
    displayModal.hide();
  }
}

function countToggleButtons(): void {
  const { count, checkedButtons } = countCheckedToggleButtons();
  handleModalDisplay(count);
}

function createToggleInput(
  index: number,
  coin: CryptoCoins,
  arrayOfCoins: CryptoCoins[]
): HTMLDivElement {
  const toggleDiv = document.createElement(`div`) as HTMLDivElement;
  toggleDiv.classList.add(
    `form-check`,
    `form-switch`,
    `d-flex`,
    `justify-content-end`
  );

  const toggleInput = document.createElement(`input`) as HTMLInputElement;
  toggleInput.setAttribute(`type`, `checkbox`);
  toggleInput.classList.add(`form-check-input`);
  toggleInput.id = `toggleInput${index}`;

  toggleInputWithEventListener(index, coin, toggleInput, arrayOfCoins);

  toggleDiv.appendChild(toggleInput);

  return toggleDiv;
}

function toggleInputWithEventListener(
  index: number,
  coin: CryptoCoins,
  toggleInput: HTMLInputElement,
  arrayOfCoins: CryptoCoins[]
): void {
  toggleInput.addEventListener(`change`, function (): void {
    countToggleButtons();
    saveToggleStateInLocalStorage(toggleInput, coin, arrayOfCoins);
  });
}

function createMoreInfoButton(index: number): HTMLButtonElement {
  const moreInfoButton = document.createElement(`button`) as HTMLButtonElement;
  moreInfoButton.classList.add(`btn`, `btn-primary`);
  moreInfoButton.id = `collapseExampleButton${index}`;
  moreInfoButton.type = `button`;
  moreInfoButton.setAttribute(`data-bs-toggle`, `collapse`);
  moreInfoButton.setAttribute(`data-bs-target`, `#collapseExample${index}`);
  moreInfoButton.setAttribute(`aria-expanded`, `false`);
  moreInfoButton.setAttribute(`aria-controls`, `collapseExample${index}`);
  moreInfoButton.textContent = `More info`;

  return moreInfoButton;
}

async function fetchData(
  idCoinData: CryptoCoinsInfo,
  index: number
): Promise<CryptoCoinsInfo> {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${idCoinData.id}`
  );
  const data = await response.json();

  let lastFetchTimes: number[] = JSON.parse(
    localStorage.getItem(`lastFetchTimes`) || "[]"
  );
  lastFetchTimes[index] = Date.now();
  localStorage.setItem(`lastFetchTimes`, JSON.stringify(lastFetchTimes));

  return data;
}

async function updateUI(
  idCoinData: CryptoCoinsInfo,
  infoContainer: HTMLDivElement,
  moreInfoButton: HTMLButtonElement
): Promise<void> {
  infoContainer.innerHTML = "";

  if (
    infoContainer.style.display === "none" ||
    infoContainer.style.display === ""
  ) {
    infoContainer.style.display = "block";

    const divTitle = createDivCollapseTitle(idCoinData);
    const priceInfo = createPriceInfo(idCoinData);

    infoContainer.appendChild(divTitle);
    infoContainer.appendChild(await priceInfo);

    moreInfoButton.textContent = "Less info";
  } else {
    infoContainer.style.display = "none";
    moreInfoButton.textContent = "More info";
  }
}

function toggleVisibility(
  infoContainer: HTMLDivElement,
  moreInfoButton: HTMLButtonElement
): void {
  if (
    infoContainer.style.display === "none" ||
    infoContainer.style.display === ""
  ) {
    infoContainer.style.display = "block";
    moreInfoButton.textContent = "Less info";
  } else {
    infoContainer.style.display = "none";
    moreInfoButton.textContent = "More info";
  }
}

async function collapseButton(
  idCoinData: CryptoCoinsInfo,
  index: number
): Promise<void> {
  const infoContainer = document.querySelector(
    `#collapseExampleContent${index}`
  ) as HTMLDivElement;
  const moreInfoButton = document.querySelector(
    `#collapseExampleButton${index}`
  ) as HTMLButtonElement;

  let lastFetchTimes: number[] = JSON.parse(
    localStorage.getItem(`lastFetchTimes`) || "[]"
  );
  const currentTime: number = Date.now();
  const twoMinutesInMilliseconds: number = 2 * 60 * 1000;

  if (
    lastFetchTimes.length <= index ||
    currentTime - lastFetchTimes[index] > twoMinutesInMilliseconds
  ) {
    idCoinData = await fetchData(idCoinData, index);
    updateUI(idCoinData, infoContainer, moreInfoButton);
  } else {
    toggleVisibility(infoContainer, moreInfoButton);
  }
}

function createDivCollapseCard(): HTMLDivElement {
  const divCollapseCard = document.createElement(`div`) as HTMLDivElement;
  divCollapseCard.classList.add(`card`, `card-body`);
  divCollapseCard.id = `collapseExampleContent`;
  return divCollapseCard;
}

function createDivCollapseTitle(
  idCoinData: CryptoCoinsInfo
): HTMLHeadingElement {
  const divTitle = document.createElement(`h5`) as HTMLHeadingElement;
  divTitle.classList.add(`card-title`, `text-center`);
  const image = document.createElement(`img`) as HTMLImageElement;
  image.src = idCoinData.image.thumb;
  divTitle.appendChild(image);
  return divTitle;
}

async function createPriceInfo(
  idCoinData: CryptoCoinsInfo
): Promise<HTMLParagraphElement> {
  const priceInfo = document.createElement(`p`) as HTMLParagraphElement;
  priceInfo.classList.add(`card-text`, `text-center`, `fs-5`, `fw-bold`);

  try {
    const updatedData = await getInfoFromApiById(idCoinData.id);
    priceInfo.innerHTML = `USD: ${updatedData.market_data.current_price.usd} $<br> EUR: ${updatedData.market_data.current_price.eur} €<br> ILS: ${updatedData.market_data.current_price.ils} ₪`;
  } catch (error) {
    console.error(`${new Date().toISOString()} - Failed to fetch data:`, error);
  }

  updatePriceInfo(idCoinData, priceInfo);

  return priceInfo;
}

async function updatePriceInfo(
  idCoinData: CryptoCoinsInfo,
  priceInfo: HTMLParagraphElement
) {
  try {
    const updatedData = await getInfoFromApiById(idCoinData.id);
    priceInfo.innerHTML = `USD: ${updatedData.market_data.current_price.usd} $<br> EUR: ${updatedData.market_data.current_price.eur} €<br> ILS: ${updatedData.market_data.current_price.ils} ₪`;
  } catch (error) {
    console.error(`${new Date().toISOString()} - Failed to fetch data:`, error);
  }

  setTimeout(async () => {
    await createPriceInfo(idCoinData);
  }, 120000);
}

function createSpinnerForCollapse(): HTMLDivElement {
  const spinnerDiv = document.createElement(`div`) as HTMLDivElement;
  spinnerDiv.classList.add(`spinner-border`, `text-primary`);
  spinnerDiv.setAttribute(`role`, `status`);
  spinnerDiv.innerHTML = `<span class="visually-hidden">Loading...</span>`;

  return spinnerDiv;
}

// function searchCoin(arrayOfCoins: CryptoCoins[]): void {
//   const searchInput = document.querySelector(`#search`) as HTMLInputElement;
//   const searchBtn = document.querySelector(`#searchBtn`) as HTMLButtonElement;

//   searchBtn.addEventListener(`click`, () => {
//     const searchValue = searchInput.value.toLowerCase();

//     const filteredCoins = arrayOfCoins.filter((coin) => {
//       return (
//         coin.name.toLowerCase().includes(searchValue) ||
//         coin.symbol.toLowerCase().includes(searchValue)
//       );
//     });

//     const cardRow = document.querySelector(`#card`) as HTMLDivElement;

//     cardRow.innerHTML = ``;

//     createCardInHtml(filteredCoins);
//   });
// }

function searchCoin(arrayOfCoins: CryptoCoins[]): void {
  const searchInput = document.querySelector(`#search`) as HTMLInputElement;
  const searchBtn = document.querySelector(`#searchBtn`) as HTMLButtonElement;

  searchBtn.addEventListener(`click`, () =>
    handleSearchClick(arrayOfCoins, searchInput)
  );
}

function handleSearchClick(
  arrayOfCoins: CryptoCoins[],
  searchInput: HTMLInputElement
): void {
  const searchValue = searchInput.value.toLowerCase();

  const filteredCoins = arrayOfCoins.filter((coin) => {
    return (
      coin.name.toLowerCase().includes(searchValue) ||
      coin.symbol.toLowerCase().includes(searchValue)
    );
  });

  const cardRow = document.querySelector(`#card`) as HTMLDivElement;

  cardRow.innerHTML = ``;

  createCardInHtml(filteredCoins);
}

function resetSearch(arrayOfCoins: CryptoCoins[]): void {
  const resetBtn = document.querySelector(`#resetBtn`) as HTMLButtonElement;
  const searchInput = document.querySelector(`#search`) as HTMLInputElement;

  resetBtn.addEventListener(`click`, () =>
    handleresetSearch(arrayOfCoins, searchInput)
  );
}

function handleresetSearch(
  arrayOfCoins: CryptoCoins[],
  searchInput: HTMLInputElement
): void {
  const cardRow = document.querySelector(`#card`) as HTMLDivElement;

  cardRow.innerHTML = ``;
  searchInput.value = ``;

  createCardInHtml(arrayOfCoins);

  updateToggleStatesOnLoad(arrayOfCoins);
}

function modalBody(arrayOfCoins: CryptoCoins[]): void {
  const modalBody = document.querySelector(`.modal-body`) as HTMLDivElement;
  const saveChangesBtn = document.querySelector(
    `#saveBtn`
  ) as HTMLButtonElement;

  let toggleInput: CryptoCoins[] = JSON.parse(
    localStorage.getItem("toggleInput") || "[]"
  );

  modalBody.innerHTML = "";

  toggleInput.forEach((coin) => {
    const coinElement = document.createElement("div");
    coinElement.innerHTML = `
      Name: ${coin}
      <button id="removeBtn-${coin}" class="btn btn-danger">Remove</button>
  `;
    modalBody.appendChild(coinElement);

    const removeBtn = document.querySelector(
      `#removeBtn-${coin}`
    ) as HTMLButtonElement;

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        toggleInput = toggleInput.filter((c) => c !== coin);

        localStorage.setItem("toggleInput", JSON.stringify(toggleInput));

        coinElement.remove();
      });
    }
  });

  saveChangesBtn.addEventListener("click", () => {
    handleSaveChangesButton(arrayOfCoins, toggleInput);
  });
}

function handleSaveChangesButton(
  arrayOfCoins: CryptoCoins[],
  toggleInput: CryptoCoins[]
) {
  const myModalEl = document.querySelector(".modal") as HTMLElement;
  const myModal = myModalEl ? bootstrap.Modal.getInstance(myModalEl) : null;
  if (myModal) {
    myModal.hide();
  }

  localStorage.setItem("toggleInput", JSON.stringify(toggleInput));

  updateToggleStatesOnLoad(arrayOfCoins);
}

// charts
// window.onload = function () {
//   var options = {
//     exportEnabled: true,
//     animationEnabled: true,
//     title: {
//       text: "Units Sold VS Profit",
//     },
//     subtitles: [
//       {
//         text: "Click Legend to Hide or Unhide Data Series",
//       },
//     ],
//     axisX: {
//       title: "States",
//     },
//     axisY: {
//       title: "Units Sold",
//       titleFontColor: "#4F81BC",
//       lineColor: "#4F81BC",
//       labelFontColor: "#4F81BC",
//       tickColor: "#4F81BC",
//     },
//     axisY2: {
//       title: "Profit in USD",
//       titleFontColor: "#C0504E",
//       lineColor: "#C0504E",
//       labelFontColor: "#C0504E",
//       tickColor: "#C0504E",
//     },
//     toolTip: {
//       shared: true,
//     },
//     legend: {
//       cursor: "pointer",
//       itemclick: toggleDataSeries,
//     },
//     data: [
//       {
//         type: "spline",
//         name: "Units Sold",
//         showInLegend: true,
//         xValueFormatString: "MMM YYYY",
//         yValueFormatString: "#,##0 Units",
//         dataPoints: [
//           { x: new Date(2016, 0, 1), y: 120 },
//           { x: new Date(2016, 1, 1), y: 135 },
//           { x: new Date(2016, 2, 1), y: 144 },
//           { x: new Date(2016, 3, 1), y: 103 },
//           { x: new Date(2016, 4, 1), y: 93 },
//           { x: new Date(2016, 5, 1), y: 129 },
//           { x: new Date(2016, 6, 1), y: 143 },
//           { x: new Date(2016, 7, 1), y: 156 },
//           { x: new Date(2016, 8, 1), y: 122 },
//           { x: new Date(2016, 9, 1), y: 106 },
//           { x: new Date(2016, 10, 1), y: 137 },
//           { x: new Date(2016, 11, 1), y: 142 },
//         ],
//       },
//       {
//         type: "spline",
//         name: "Profit",
//         axisYType: "secondary",
//         showInLegend: true,
//         xValueFormatString: "MMM YYYY",
//         yValueFormatString: "$#,##0.#",
//         dataPoints: [
//           { x: new Date(2016, 0, 1), y: 19034.5 },
//           { x: new Date(2016, 1, 1), y: 20015 },
//           { x: new Date(2016, 2, 1), y: 27342 },
//           { x: new Date(2016, 3, 1), y: 20088 },
//           { x: new Date(2016, 4, 1), y: 20234 },
//           { x: new Date(2016, 5, 1), y: 29034 },
//           { x: new Date(2016, 6, 1), y: 30487 },
//           { x: new Date(2016, 7, 1), y: 32523 },
//           { x: new Date(2016, 8, 1), y: 20234 },
//           { x: new Date(2016, 9, 1), y: 27234 },
//           { x: new Date(2016, 10, 1), y: 33548 },
//           { x: new Date(2016, 11, 1), y: 32534 },
//         ],
//       },
//     ],
//   };

//   ($("#chartContainer") as any).CanvasJSChart(options);

//   function toggleDataSeries(e: any) {
//     if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
//       e.dataSeries.visible = false;
//     } else {
//       e.dataSeries.visible = true;
//     }
//     e.chart.render();
//   }
// };

// function hiddenHomePageForLiveReports() {
//   const charts = document.querySelector(`.charts`) as HTMLDivElement;
//   const liveReportsBtn = document.querySelector(
//     `#liveReports`
//   ) as HTMLInputElement;
//   const homePage = document.querySelector(`.hideMe`) as HTMLDivElement;

//   liveReportsBtn.addEventListener("click", function () {
//     homePage.setAttribute("hidden", "true");
//     charts.removeAttribute("hidden");
//   });
// }

// hiddenHomePageForLiveReports();

// async function fetchForCharts(
//   arrayOfCoins: CryptoCoins[],
//   toggleArray: string[]
// ) {
//   const response = await fetch(
//     `https://min-api.cryptocompare.com/data/pricemulti?fsyms=$&tsyms=USD`
//   );
//   const data = await response.json();
// }
