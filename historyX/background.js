// delete history older than ${range}
const now = Date.now();
const range = 3;
const endTime = now - range * 24 * 60 * 60 * 1000;

// executes once on browser launch
chrome.history.deleteRange({ startTime: 0, endTime }, () => {
  console.log(`Deleted all history older than ${range} days`);
});

// remove search engine search results from history
function deleteSearches() {
  // search engines to monitor
  const searchUrls = ["google.com/search", "bing.com/search", "duckduckgo.com"];
  // Delete specific search history entries
  chrome.history.search({ text: "", maxResults: 10 }, (results) => {
    results.forEach((page) => {
      if (searchUrls.some((sub) => page.url.includes(sub))) {
        chrome.history.deleteUrl({ url: page.url });
      }
    });
  });
}

// Keep history capped at ${limit} entries (Only returns results in each 24 hours)
function capHistory() {
  chrome.storage.local.get(["historyLimit"], ({ historyLimit }) => {
    const limit = historyLimit || 0; // 0 = unlimited

    chrome.history.search({ text: "", maxResults: 0 }, (allResults) => {
      console.log(`History: ${allResults.length}, Limit: ${limit}`);
      if (limit === 0 || allResults.length <= limit) return;

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
  deleteSearches();
  capHistory();
});
