function deleteHistoryRange() {
  chrome.storage.local.get(["historyRange"], ({ historyRange }) => {
    const range = historyRange || 0; // 0 = unlimited
    if (range <= 0) return;

    const now = Date.now();
    const endTime = now - range * 24 * 60 * 60 * 1000;

    chrome.history.deleteRange({ startTime: 0, endTime }, () => {
      console.log(`Deleted all history older than ${range} days`);
    });
  });
}

// executes once on browser launch
deleteHistoryRange();

// accepted search engines in the UI
const searchEngines = {
      google: "google.com/search",
        bing: "bing.com/search",
  duckduckgo: "duckduckgo.com",
       yahoo: "search.yahoo.com/search",
      yandex: "yandex.com/search"
};

// remove search engine search results from history
function historyFilter(item) {
  chrome.storage.local.get(["activeFilters", "customUrls"], ({ activeFilters = [], customUrls = [] }) => {
    const filtered = [...customUrls];

    activeFilters.forEach((key) => {
      const url = searchEngines[key];
      if (url) filtered.push(url);
    });

    if (filtered.some((sub) => item.url.includes(sub))) {
      chrome.history.deleteUrl({ url: item.url });
    }
  });
}

// Keep history capped at ${limit} entries (Only returns results in each 24 hours)
function capHistory() {
  chrome.storage.local.get("historyLimit", ({ historyLimit }) => {
    const limit = historyLimit || 0; // 0 = unlimited
    if (limit <= 0) return;

    chrome.history.search({ text: "", maxResults: 0, startTime: 0 }, (results) => {
      console.log(`History: ${results.length}, Limit: ${limit}`);
      if (results.length <= limit) return;

      const toDelete = results.slice(limit);
      toDelete.forEach((page) => {
        chrome.history.deleteUrl({ url: page.url });
        console.log(`Purging history: ${page.url}`);
      });
    });
  });
}

// Listen for any new history entry
chrome.history.onVisited.addListener((item) => {
  historyFilter(item);
  capHistory();
});
