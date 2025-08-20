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
