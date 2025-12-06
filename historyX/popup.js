// get HTML <input> for use ${limit}
const limitInput = document.getElementById("limit");

// Load saved limit on popup open
chrome.storage.local.get(["historyLimit"], ({ historyLimit }) => {
  if (typeof historyLimit === "number") {
    limitInput.value = historyLimit;
  } else {
    limitInput.value = 0; // 0 = unlimited
  }
});

// Save new limit whenever user changes it
limitInput.addEventListener("change", () => {
  const limit = parseInt(limitInput.value, 10);
  chrome.storage.local.set({ historyLimit: isNaN(limit) ? 0 : limit }, () => {
    console.log(`Saved history limit: ${limitInput.value}`);
  });
});
