"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class CryptoCoinsInfo {
    constructor(id, symbol, image, market_data) {
        this.image = image;
        this.market_data = market_data;
        this.id = id;
        this.symbol = symbol;
    }
}
class CryptoCoins {
    constructor(id, name, symbol) {
        this.id = id;
        this.name = name;
        this.symbol = symbol;
    }
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://api.coingecko.com/api/v3/coins/list`);
            const coinData = yield response.json();
            display100Coins(coinData);
        }
        catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    });
})();
function getInfoFromApiById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
            const idCoinData = yield response.json();
            if (!isDataAlreadySaved(idCoinData)) {
                saveInlocalStorage(idCoinData);
            }
            return idCoinData;
        }
        catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }
    });
}
function isDataAlreadySaved(idCoinData) {
    const coinDataArray = JSON.parse(localStorage.getItem(`coinDataArray`) || "[]");
    return coinDataArray.some((coinData) => coinData.id === idCoinData.id);
}
function saveInlocalStorage(idCoinData) {
    const coinDataArray = JSON.parse(localStorage.getItem(`coinDataArray`) || "[]");
    coinDataArray.push(idCoinData);
    localStorage.setItem(`coinDataArray`, JSON.stringify(coinDataArray));
}
function getFirst100Coins(coinData) {
    const arrayOfCoins = [];
    for (let i = 0; i < 100; i++) {
        arrayOfCoins.push(coinData[i]);
    }
    return arrayOfCoins;
}
function processCoins(arrayOfCoins) {
    createCardInHtml(arrayOfCoins);
    mainSpinner();
    updateToggleStatesOnLoad(arrayOfCoins);
    countToggleButtons();
    resetSearch(arrayOfCoins);
}
function display100Coins(coinData) {
    const arrayOfCoins = getFirst100Coins(coinData);
    processCoins(arrayOfCoins);
}
function mainSpinner() {
    const loading = document.querySelector(".spinner-border");
    if (loading) {
        loading.style.display = "none";
    }
}
function createCardElements(coin, index, arrayOfCoins) {
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
function appendCardElements(elements, cardBodyDiv) {
    cardBodyDiv.appendChild(elements.cardTitle);
    cardBodyDiv.appendChild(elements.cardText);
    cardBodyDiv.appendChild(elements.toggleInput);
    cardBodyDiv.appendChild(elements.moreInfoButton);
    cardBodyDiv.appendChild(elements.infoContainer);
}
function setupCardEvents(elements, coin, index, arrayOfCoins) {
    searchCoin(arrayOfCoins);
    moreInfoButtonWithEventListener(index, coin, elements.moreInfoButton);
}
function createCardInHtml(arrayOfCoins) {
    const cardsRow = document.querySelector(`#card`);
    arrayOfCoins.forEach((coin, index) => {
        const elements = createCardElements(coin, index, arrayOfCoins);
        cardsRow.appendChild(elements.cardDiv);
        elements.cardDiv.appendChild(elements.cardBodyDiv);
        appendCardElements(elements, elements.cardBodyDiv);
        setupCardEvents(elements, coin, index, arrayOfCoins);
    });
}
function addSpinnerToContainer(index) {
    return __awaiter(this, void 0, void 0, function* () {
        const spinner = createSpinnerForCollapse();
        const infoContainer = document.querySelector(`#collapseExampleContent${index}`);
        infoContainer.appendChild(spinner);
        return spinner;
    });
}
function removeSpinnerFromContainer(spinner) {
    spinner.remove();
}
function fetchCoinData(coinId) {
    return __awaiter(this, void 0, void 0, function* () {
        const idCoinData = yield getInfoFromApiById(coinId);
        return idCoinData;
    });
}
function moreInfoButtonWithEventListener(index, coin, moreInfoButton) {
    return __awaiter(this, void 0, void 0, function* () {
        moreInfoButton.addEventListener(`click`, function () {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const spinner = yield addSpinnerToContainer(index);
                    const idCoinData = yield fetchCoinData(coin.id);
                    removeSpinnerFromContainer(spinner);
                    collapseButton(idCoinData, index);
                }
                catch (error) {
                    console.error(`Error: ${error}`);
                    throw error;
                }
            });
        });
    });
}
function createCard() {
    const cardDiv = document.createElement(`div`);
    cardDiv.classList.add(`card`, `col-md-4`);
    return cardDiv;
}
function createCardBody() {
    const cardBodyDiv = document.createElement(`div`);
    cardBodyDiv.classList.add(`card-body`);
    return cardBodyDiv;
}
function createCardTitle(coin) {
    const divTitle = document.createElement(`h5`);
    divTitle.classList.add(`card-title`);
    divTitle.id = `symbolCoin`;
    divTitle.textContent = coin.symbol;
    return divTitle;
}
function createCardText(coin) {
    const cardTextDiv = document.createElement(`p`);
    cardTextDiv.classList.add(`card-text`);
    cardTextDiv.textContent = coin.name;
    return cardTextDiv;
}
function getToggleArrayFromLocalStorage() {
    return JSON.parse(localStorage.getItem("toggleInput") || "[]");
}
function saveToggleArrayToLocalStorage(toggleArray) {
    localStorage.setItem("toggleInput", JSON.stringify(toggleArray));
}
function handleToggleChecked(toggleInput, coin, arrayOfCoins, toggleArray) {
    if (toggleArray.length < 6 && !toggleArray.includes(coin.symbol)) {
        toggleArray.push(coin.symbol);
        saveToggleArrayToLocalStorage(toggleArray);
        modalBody(arrayOfCoins);
    }
    else {
        toggleInput.checked = false;
    }
}
function handleToggleUnchecked(coin, arrayOfCoins, toggleArray) {
    toggleArray = toggleArray.filter((id) => id !== coin.symbol);
    saveToggleArrayToLocalStorage(toggleArray);
    modalBody(arrayOfCoins);
}
function saveToggleStateInLocalStorage(toggleInput, coin, arrayOfCoins) {
    let toggleArray = getToggleArrayFromLocalStorage();
    if (toggleInput.checked) {
        handleToggleChecked(toggleInput, coin, arrayOfCoins, toggleArray);
    }
    else {
        handleToggleUnchecked(coin, arrayOfCoins, toggleArray);
    }
}
function updateToggleStatesOnLoad(arrayOfCoins) {
    const toggleArray = JSON.parse(localStorage.getItem(`toggleInput`) || "[]");
    arrayOfCoins.forEach((coin, index) => {
        const toggleInput = document.querySelector(`#toggleInput${index}`);
        if (toggleArray.includes(coin.symbol)) {
            toggleInput.checked = true;
        }
        else {
            toggleInput.checked = false;
        }
    });
}
function countCheckedToggleButtons() {
    const allToggleButtons = document.querySelectorAll(".form-check-input");
    const toggleInputChecked = [];
    let toggleButtonCounter = 0;
    allToggleButtons.forEach((toggleButton) => {
        if (toggleButton.checked) {
            toggleButtonCounter++;
            toggleInputChecked.push(toggleButton);
        }
    });
    return { count: toggleButtonCounter, checkedButtons: toggleInputChecked };
}
function handleModalDisplay(count) {
    const displayModal = new bootstrap.Modal(".modal");
    if (count > 5) {
        displayModal.show();
    }
    else {
        displayModal.hide();
    }
}
function countToggleButtons() {
    const { count, checkedButtons } = countCheckedToggleButtons();
    handleModalDisplay(count);
}
function createToggleInput(index, coin, arrayOfCoins) {
    const toggleDiv = document.createElement(`div`);
    toggleDiv.classList.add(`form-check`, `form-switch`, `d-flex`, `justify-content-end`);
    const toggleInput = document.createElement(`input`);
    toggleInput.setAttribute(`type`, `checkbox`);
    toggleInput.classList.add(`form-check-input`);
    toggleInput.id = `toggleInput${index}`;
    toggleInputWithEventListener(index, coin, toggleInput, arrayOfCoins);
    toggleDiv.appendChild(toggleInput);
    return toggleDiv;
}
function toggleInputWithEventListener(index, coin, toggleInput, arrayOfCoins) {
    toggleInput.addEventListener(`change`, function () {
        countToggleButtons();
        saveToggleStateInLocalStorage(toggleInput, coin, arrayOfCoins);
    });
}
function createMoreInfoButton(index) {
    const moreInfoButton = document.createElement(`button`);
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
function fetchData(idCoinData, index) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`https://api.coingecko.com/api/v3/coins/${idCoinData.id}`);
        const data = yield response.json();
        let lastFetchTimes = JSON.parse(localStorage.getItem(`lastFetchTimes`) || "[]");
        lastFetchTimes[index] = Date.now();
        localStorage.setItem(`lastFetchTimes`, JSON.stringify(lastFetchTimes));
        return data;
    });
}
function updateUI(idCoinData, infoContainer, moreInfoButton) {
    return __awaiter(this, void 0, void 0, function* () {
        infoContainer.innerHTML = "";
        if (infoContainer.style.display === "none" ||
            infoContainer.style.display === "") {
            infoContainer.style.display = "block";
            const divTitle = createDivCollapseTitle(idCoinData);
            const priceInfo = createPriceInfo(idCoinData);
            infoContainer.appendChild(divTitle);
            infoContainer.appendChild(yield priceInfo);
            moreInfoButton.textContent = "Less info";
        }
        else {
            infoContainer.style.display = "none";
            moreInfoButton.textContent = "More info";
        }
    });
}
function toggleVisibility(infoContainer, moreInfoButton) {
    if (infoContainer.style.display === "none" ||
        infoContainer.style.display === "") {
        infoContainer.style.display = "block";
        moreInfoButton.textContent = "Less info";
    }
    else {
        infoContainer.style.display = "none";
        moreInfoButton.textContent = "More info";
    }
}
function collapseButton(idCoinData, index) {
    return __awaiter(this, void 0, void 0, function* () {
        const infoContainer = document.querySelector(`#collapseExampleContent${index}`);
        const moreInfoButton = document.querySelector(`#collapseExampleButton${index}`);
        let lastFetchTimes = [];
        const lastFetchTimesFromStorage = localStorage.getItem("lastFetchTimes");
        if (lastFetchTimesFromStorage &&
            lastFetchTimesFromStorage.startsWith("[") &&
            lastFetchTimesFromStorage.endsWith("]")) {
            lastFetchTimes = JSON.parse(lastFetchTimesFromStorage);
        }
        const currentTime = Date.now();
        const twoMinutesInMilliseconds = 2 * 60 * 1000;
        if (lastFetchTimes.length <= index ||
            lastFetchTimes[index] === null ||
            (typeof lastFetchTimes[index] === "number" &&
                currentTime - lastFetchTimes[index] > twoMinutesInMilliseconds)) {
            idCoinData = yield fetchData(idCoinData, index);
            updateUI(idCoinData, infoContainer, moreInfoButton);
        }
        else {
            toggleVisibility(infoContainer, moreInfoButton);
        }
    });
}
function createDivCollapseCard() {
    const divCollapseCard = document.createElement(`div`);
    divCollapseCard.classList.add(`card`, `card-body`);
    divCollapseCard.id = `collapseExampleContent`;
    return divCollapseCard;
}
function createDivCollapseTitle(idCoinData) {
    const divTitle = document.createElement(`h5`);
    divTitle.classList.add(`card-title`, `text-center`);
    const image = document.createElement(`img`);
    image.src = idCoinData.image.thumb;
    divTitle.appendChild(image);
    return divTitle;
}
function createPriceInfo(idCoinData) {
    return __awaiter(this, void 0, void 0, function* () {
        const priceInfo = document.createElement(`p`);
        priceInfo.classList.add(`card-text`, `text-center`, `fs-5`, `fw-bold`);
        try {
            const updatedData = yield getInfoFromApiById(idCoinData.id);
            priceInfo.innerHTML = `USD: ${updatedData.market_data.current_price.usd} $<br> EUR: ${updatedData.market_data.current_price.eur} €<br> ILS: ${updatedData.market_data.current_price.ils} ₪`;
        }
        catch (error) {
            console.error(`${new Date().toISOString()} - Failed to fetch data:`, error);
        }
        updatePriceInfo(idCoinData, priceInfo);
        return priceInfo;
    });
}
function updatePriceInfo(idCoinData, priceInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedData = yield getInfoFromApiById(idCoinData.id);
            priceInfo.innerHTML = `USD: ${updatedData.market_data.current_price.usd} $<br> EUR: ${updatedData.market_data.current_price.eur} €<br> ILS: ${updatedData.market_data.current_price.ils} ₪`;
        }
        catch (error) {
            console.error(`${new Date().toISOString()} - Failed to fetch data:`, error);
        }
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield createPriceInfo(idCoinData);
        }), 120000);
    });
}
function createSpinnerForCollapse() {
    const spinnerDiv = document.createElement(`div`);
    spinnerDiv.classList.add(`spinner-border`, `text-primary`);
    spinnerDiv.setAttribute(`role`, `status`);
    spinnerDiv.innerHTML = `<span class="visually-hidden">Loading...</span>`;
    return spinnerDiv;
}
function searchCoin(arrayOfCoins) {
    const searchInput = document.querySelector(`#search`);
    const searchBtn = document.querySelector(`#searchBtn`);
    searchBtn.addEventListener(`click`, () => handleSearchClick(arrayOfCoins, searchInput));
}
function handleSearchClick(arrayOfCoins, searchInput) {
    const searchValue = searchInput.value.toLowerCase();
    const filteredCoins = arrayOfCoins.filter((coin) => {
        return (coin.name.toLowerCase().includes(searchValue) ||
            coin.symbol.toLowerCase().includes(searchValue));
    });
    const cardRow = document.querySelector(`#card`);
    cardRow.innerHTML = ``;
    createCardInHtml(filteredCoins);
}
function resetSearch(arrayOfCoins) {
    const resetBtn = document.querySelector(`#resetBtn`);
    const searchInput = document.querySelector(`#search`);
    resetBtn.addEventListener(`click`, () => handleresetSearch(arrayOfCoins, searchInput));
}
function handleresetSearch(arrayOfCoins, searchInput) {
    const cardRow = document.querySelector(`#card`);
    cardRow.innerHTML = ``;
    searchInput.value = ``;
    createCardInHtml(arrayOfCoins);
    updateToggleStatesOnLoad(arrayOfCoins);
}
function modalBody(arrayOfCoins) {
    const modalBody = document.querySelector(`.modal-body`);
    const saveChangesBtn = document.querySelector(`#saveBtn`);
    let toggleInput = JSON.parse(localStorage.getItem("toggleInput") || "[]");
    modalBody.innerHTML = "";
    toggleInput.forEach((coin) => {
        const coinElement = document.createElement("div");
        coinElement.innerHTML = `
      Name: ${coin}
      <button id="removeBtn-${coin}" class="btn btn-danger">Remove</button>
  `;
        modalBody.appendChild(coinElement);
        const removeBtn = document.querySelector(`#removeBtn-${coin}`);
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
function handleSaveChangesButton(arrayOfCoins, toggleInput) {
    const myModalEl = document.querySelector(".modal");
    const myModal = myModalEl ? bootstrap.Modal.getInstance(myModalEl) : null;
    if (myModal) {
        myModal.hide();
    }
    localStorage.setItem("toggleInput", JSON.stringify(toggleInput));
    updateToggleStatesOnLoad(arrayOfCoins);
}
