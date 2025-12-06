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

function saveToStorage(id, element) {
  const value = parseInt(element.value, 10);
  const sanitizedValue = isNaN(value) ? 0 : value;

  chrome.storage.local.set({ [id]: sanitizedValue }, () => {
    console.log(`Saved history ${id}: ${sanitizedValue}`);
  });
}

const rangeInput = document.getElementById("range");
const limitInput = document.getElementById("limit");

getFromStorage("historyRange", rangeInput);
getFromStorage("historyLimit", limitInput);

rangeInput.addEventListener("change", () => {
  saveToStorage("historyRange", rangeInput);
});

limitInput.addEventListener("change", () => {
  saveToStorage("historyLimit", limitInput);
});
