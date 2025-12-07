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
function historyFilter() {
  chrome.storage.local.get("activeFilters", ({ activeFilters = [] }) => {
    if (!activeFilters.length) return;

    const filteredUrls = [];

    activeFilters.forEach((url) => {
      const foundUrl = searchEngines[url];
      if (foundUrl) filteredUrls.push(foundUrl);
    });

    // Delete specific search history entries
    chrome.history.search({ text: "", maxResults: 10 }, (results) => {
      results.forEach((page) => {
        if (filteredUrls.some((sub) => page.url.includes(sub))) {
          chrome.history.deleteUrl({ url: page.url });
        }
      });
    });
  });
}

// Keep history capped at ${limit} entries (Only returns results in each 24 hours)
function capHistory() {
  chrome.storage.local.get("historyLimit", ({ historyLimit }) => {
    const limit = historyLimit || 0; // 0 = unlimited

    chrome.history.search({ text: "", maxResults: 0 }, (allResults) => {
      console.log(`History: ${allResults.length}, Limit: ${limit}`);
      if (limit <= 0 || allResults.length <= limit) return;

      const toDelete = allResults.slice(limit);
      toDelete.forEach((page) => {
        chrome.history.deleteUrl({ url: page.url });
        console.log(`Purging history: ${page.url}`);
      });
    });
  });
}

// Listen for any navigation
chrome.webNavigation.onCommitted.addListener((details) => {
  historyFilter();
  capHistory();
});
