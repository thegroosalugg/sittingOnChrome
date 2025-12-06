// ***DEALS WITH USER INPUT DATA
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

// *** DYNAMICALLY LOAD SVG ICONS FROM DIRECTORY
// get SVG icons container
const iconsContainer = document.getElementById("search-icons");

// accepted icons in directory
const icons = ["google", "bing", "duckduckgo", "yahoo", "yandex"];

// dynamically loads SVG icons from /icons directory
// 1. fetch active filters once
chrome.storage.local.get("activeFilters", ({ activeFilters = [] }) => {
  console.log("Active Search Filters", activeFilters);
  // 2. loop through icons
  iconsContainer.querySelectorAll("div[data-icon]").forEach(async (el) => {
    const iconName = el.getAttribute("data-icon");
    if (!icons.includes(iconName)) return; // early return for non approved icons

    const response = await fetch(`icons/${iconName}.svg`); // load icon.svg from /icons directory
    const svgText = await response.text(); // convert to text
    el.innerHTML = svgText; // set inner HTML as SVG content

    const svg = el.querySelector("svg"); // get SVG element fron inside <div data-icon>
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
