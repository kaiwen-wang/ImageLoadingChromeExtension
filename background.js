chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isEnabled: true });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get('isEnabled', (data) => {
    const newState = !data.isEnabled;
    chrome.storage.local.set({ isEnabled: newState }, () => {
      // Notify the content script to update the UI
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle', isEnabled: newState });
      });
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getImageSize') {
    fetch(request.url, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          const size = response.headers.get('Content-Length');
          sendResponse({ size: parseInt(size, 10) });
        } else {
          sendResponse({ error: 'Failed to fetch image size.' });
        }
      })
      .catch(error => {
        sendResponse({ error: error.message });
      });

    return true; // Indicates that the response is sent asynchronously.
  }
});