class CryptoCoinsInfo {
  id: string;
  symbol: string;
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
    symbol: string,
    image: { thumb: string },
    market_data: { current_price: { usd: number; eur: number; ils: number } }
  ) {
    this.image = image;
    this.market_data = market_data;
    this.id = id;
    this.symbol = symbol;
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

function appendCardElements(
  elements: {
    cardDiv?: HTMLDivElement;
    cardBodyDiv?: HTMLDivElement;
    cardTitle: HTMLDivElement;
    cardText: HTMLDivElement;
    toggleInput: HTMLDivElement;
    moreInfoButton: HTMLButtonElement;
    infoContainer: HTMLDivElement;
  },
  cardBodyDiv: HTMLDivElement
) {
  cardBodyDiv.appendChild(elements.cardTitle);
  cardBodyDiv.appendChild(elements.cardText);
  cardBodyDiv.appendChild(elements.toggleInput);
  cardBodyDiv.appendChild(elements.moreInfoButton);
  cardBodyDiv.appendChild(elements.infoContainer);
}

function setupCardEvents(
  elements: {
    cardDiv?: HTMLDivElement;
    cardBodyDiv?: HTMLDivElement;
    cardTitle?: HTMLDivElement;
    cardText?: HTMLDivElement;
    toggleInput?: HTMLDivElement;
    moreInfoButton: HTMLButtonElement;
    infoContainer?: HTMLDivElement;
  },
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
  if (toggleArray.length < 6 && !toggleArray.includes(coin.symbol)) {
    toggleArray.push(coin.symbol);
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
  toggleArray = toggleArray.filter((id) => id !== coin.symbol);
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

    if (toggleArray.includes(coin.symbol)) {
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

window.onload = async function chartCoin() {
  // Retrieve the coin ID from localStorage
  const toggleInput = JSON.parse(localStorage.getItem("toggleInput") || "");
  // Make a fetch request to the API using the coin ID
  const response = await fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${toggleInput}&tsyms=USD`
  );

  // Parse the response to get the coin value in USD
  const data = await response.json();
  const coinValue = data[toggleInput].USD;

  var chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    zoomEnabled: true,
    theme: "dark2",
    title: {
      text: "Business Growth From 2000 to 2017",
    },
    axisX: {
      title: "Year",
      valueFormatString: "####",
      interval: 2,
    },
    axisY: {
      logarithmic: true, //change it to false
      title: "Profit in USD (Log)",
      prefix: "$",
      titleFontColor: "#6D78AD",
      lineColor: "#6D78AD",
      gridThickness: 0,
      lineThickness: 1,
      labelFormatter: addSymbols,
    },
    axisY2: {
      title: "Profit in USD",
      prefix: "$",
      titleFontColor: "#51CDA0",
      logarithmic: false, //change it to true
    },
    data: [
      {
        type: "line",
        xValueFormatString: "####",
        yValueFormatString: "$#,##0.##",
        showInLegend: true,
        name: "Log Scale",
        dataPoints: [
          { x: 2001, y: 8000 },
          { x: 2002, y: 20000 },
          { x: 2003, y: 40000 },
          { x: 2004, y: 60000 },
          { x: 2005, y: 90000 },
          { x: 2006, y: 140000 },
          { x: 2007, y: 200000 },
          { x: 2008, y: 400000 },
          { x: 2009, y: 600000 },
          { x: 2010, y: 800000 },
          { x: 2011, y: 900000 },
          { x: 2012, y: 1400000 },
          { x: 2013, y: 2000000 },
          { x: 2014, y: 4000000 },
          { x: 2015, y: 6000000 },
          { x: 2016, y: 8000000 },
          { x: 2017, y: 9000000 },
        ],
      },
      {
        type: "line",
        xValueFormatString: "####",
        yValueFormatString: "$#,##0.##",
        axisYType: "secondary",
        showInLegend: true,
        name: "Linear Scale",
        dataPoints: [
          { x: 2001, y: 8000 },
          { x: 2002, y: 20000 },
          { x: 2003, y: 40000 },
          { x: 2004, y: 60000 },
          { x: 2005, y: 90000 },
          { x: 2006, y: 140000 },
          { x: 2007, y: 200000 },
          { x: 2008, y: 400000 },
          { x: 2009, y: 600000 },
          { x: 2010, y: 800000 },
          { x: 2011, y: 900000 },
          { x: 2012, y: 1400000 },
          { x: 2013, y: 2000000 },
          { x: 2014, y: 4000000 },
          { x: 2015, y: 6000000 },
          { x: 2016, y: 8000000 },
          { x: 2017, y: 9000000 },
        ],
      },
    ],
  });
  chart.render();

  function addSymbols(e: { value: number }) {
    var suffixes = ["", "K", "M", "B"];

    var order = Math.max(
      Math.floor(Math.log(Math.abs(e.value)) / Math.log(1000)),
      0
    );
    if (order > suffixes.length - 1) order = suffixes.length - 1;

    var suffix = suffixes[order];
    return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
  }
};

function handleLiveReportsButton(): void {
  const liveReportsButton = document.querySelector(
    `#liveReports`
  ) as HTMLButtonElement;

  const divCurrencyCards = document.querySelector(`#hideMe`) as HTMLDivElement;

  const divChart = document.querySelector(`#chartContainer`) as HTMLDivElement;

  liveReportsButton.addEventListener(`click`, function () {
    if (divChart.hidden) {
      divChart.hidden = false;
      divCurrencyCards.hidden = true;
    } else {
      divChart.hidden = true;
      divCurrencyCards.hidden = false;
    }
  });
}

handleLiveReportsButton();
