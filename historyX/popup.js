// ***SAVE USER INTEGER VALUES FOR HISTORY ENTRY & DAY RANGE CAPS
// get user input data from chrome storage generic function
function getFromStorage(id, element) {
  chrome.storage.local.get(id, (data) => {
    const value = data[id];
    if (typeof value === "number") {
      element.value = value;
    } else {
      element.value = 0; // 0 = unlimited
    }
  });
}

// save user input data to chrome storage generic function
function saveToStorage(id, element) {
  const value = parseInt(element.value, 10);
  const sanitizedValue = isNaN(value) ? 0 : value;

  chrome.storage.local.set({ [id]: sanitizedValue }, () => {
    console.log(`Saved history ${id}: ${sanitizedValue}`);
  });
}

// get <input> elements from DOM
const rangeInput = document.getElementById("range");
const limitInput = document.getElementById("limit");

// get the user input data from chrome storage
getFromStorage("historyRange", rangeInput);
getFromStorage("historyLimit", limitInput);

// add event listener to update <input> value on change
rangeInput.addEventListener("change", () => {
  saveToStorage("historyRange", rangeInput);
});

limitInput.addEventListener("change", () => {
  saveToStorage("historyLimit", limitInput);
});

// *** DYNAMICALLY LOAD SVG ICONS FROM DIRECTORY & SAVE USER SELECTED SEARCH ENGINES TO HISTORY FILTER
// get SVG icons container
const iconsContainer = document.getElementById("search-icons");

// accepted icons in directory
const icons = ["google", "bing", "duckduckgo", "yahoo", "yandex"];

// dynamically loads SVG icons from /icons directory
// 1. fetch active filters once
chrome.storage.local.get("activeFilters", ({ activeFilters = [] }) => {
  console.log("Active Search Filters", activeFilters);
  // 2. loop through icons
  iconsContainer.querySelectorAll("button[data-icon]").forEach(async (el) => {
    const iconName = el.getAttribute("data-icon");
    if (!icons.includes(iconName)) return; // early return for non approved icons

    const response = await fetch(`icons/${iconName}.svg`); // load icon.svg from /icons directory
    const svgText = await response.text(); // convert to text
    el.innerHTML = svgText; // set inner HTML as SVG content
    el.setAttribute("aria-label", iconName); // accessibility label

    const svg = el.querySelector("svg"); // get SVG element fron inside <button data-icon>
    if (!svg) return;
    svg.classList.add("icon"); // add class for general styling

    // 3. apply active class if present in storage
    if (activeFilters.includes(iconName)) svg.classList.add("active");

    // 4. click handler for toggling & updating storage
    el.addEventListener("click", () => {
      svg.classList.toggle("active");

      if (svg.classList.contains("active")) {
        if (!activeFilters.includes(iconName)) activeFilters.push(iconName);
      } else {
        activeFilters = activeFilters.filter(name => name !== iconName);
      }

      chrome.storage.local.set({ activeFilters }); // save to storage
    });
  });
});

// *** SAVE CUSTOM USER URLS TO HISTORY FILTER
const customUrlRow = document.getElementById("custom-url-row"); // user input container
const customUrlInput = customUrlRow.querySelector("input"); // child of user input container
const customUrlButton = customUrlRow.querySelector("button"); // child of user input container
const customUrlList = document.getElementById("custom-url-list"); // user URLs output list

let throttling = false; // prevent rapid clicks

function throttle(toggle = false) {
  throttling = toggle;
  customUrlButton.disabled = toggle; // for UI
}

function saveCustomUrl() {
  if (throttling) return; // early exit
  const url = customUrlInput.value.trim()?.toLowerCase(); // sanitize
  if (!url) return; // no UI changes for empty values
  throttle(true); // set throttle to true and disable button

  chrome.storage.local.get("customUrls", ({ customUrls = [] }) => {
    if (customUrls.includes(url)) {
      throttle(); // set throttling off
      return;
    }

    customUrls.unshift(url);
    chrome.storage.local.set({ customUrls }, () => {
      console.log(`Saved Custom Url ${customUrls}`);
      customUrlInput.value = ""; // reset <input> field
      renderRow(url); // add <html> to the DOM
      setTimeout(() => {
        throttle(); // set throttling off
      }, 1000); // 1 click per second
    });
  });
}

function deleteCustomUrl(url) {
  chrome.storage.local.get("customUrls", ({ customUrls = [] }) => {
    const updatedUrls = customUrls.filter(value => value !== url); // remove from array then save to storage
    
    chrome.storage.local.set({ customUrls: updatedUrls }, () => {
      console.log(`Delete Url ${url}`);
      const li = document.getElementById(url);
      li.remove(); // remove from DOM
    });
  });
}

// creates list item for custom URL entry
function renderRow(url) {
  const row = document.createElement("li");
  row.className = "inline-button-row";
  row.id = url;

  const text = document.createElement("p");
  text.textContent = url;

  const button = document.createElement("button");
  button.textContent = "✖";

  button.addEventListener("click", () => {
    deleteCustomUrl(url);
  });

  row.appendChild(text);
  row.appendChild(button);
  customUrlList.appendChild(row);
}

function renderList() {
  chrome.storage.local.get("customUrls", ({ customUrls = [] }) => {
    customUrlList.innerHTML = "";

    customUrls.forEach((url) => {
      renderRow(url);
    });
  });
}

// run on popup load
renderList();

customUrlButton.addEventListener("click", () => {
  saveCustomUrl();
});
