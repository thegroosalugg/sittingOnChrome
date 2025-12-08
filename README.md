# sittingOnChrome
Chrome Extensions Repo

### History-X
Additional history cleaning options for Google Chrome
#### History Cap
- manual limiter of history entries, once cap is reached, oldest is entries are removed
- chrome.history.search will only fetch entries from when app is unpacked, or value is changed
  - it does not load retroactive values before unpacking/changing, use delete range for this
- value of 0 will return function early and nothing will be removed
- protects against manual user input negative values
#### Delete History Range
- executes once when browser starts
- input how many days of history to retain: 1 - infinite
  - 0 = infinite: code will return early and rest of function will not execute
  - protects against manual user input negative values
- useful to remove stale, retroactive history entries that cannot be wiped by History Cap
#### History Filter
- custom UI to remove search engine queries from history results
  - includes google, bing, duckduckgo, yahoo, yandex
- removes the search engine URL only, not the links you click from results
- useful to declutter history, as well as preventing Omnibox from over autofilling your new searches
