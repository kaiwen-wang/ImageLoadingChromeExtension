chrome.storage.local.get('isEnabled', (data) => {
  if (data.isEnabled) {
    addImageOverlays();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    if (request.isEnabled) {
      addImageOverlays();
    } else {
      removeImageOverlays();
    }
  }
});

function addImageOverlays() {
  const images = document.getElementsByTagName('img');

  for (const image of images) {
    // Skip if the overlay is already added
    if (image.parentNode.classList.contains('image-wrapper')) {
      continue;
    }

    const imageUrl = image.src;

    chrome.runtime.sendMessage({ action: 'getImageSize', url: imageUrl }, (response) => {
      if (response.error) {
        console.error(response.error);
        return;
      }

      const size = response.size;
      const formattedSize = formatBytes(size);

      const overlay = document.createElement('div');
      overlay.className = 'image-size-overlay';
      overlay.textContent = formattedSize;

      const wrapper = document.createElement('div');
      wrapper.className = 'image-wrapper';
      image.parentNode.insertBefore(wrapper, image);
      wrapper.appendChild(image);
      wrapper.appendChild(overlay);
    });
  }
}

function removeImageOverlays() {
  const overlays = document.querySelectorAll('.image-size-overlay');
  overlays.forEach(overlay => overlay.remove());

  const wrappers = document.querySelectorAll('.image-wrapper');
  wrappers.forEach(wrapper => {
    const image = wrapper.querySelector('img');
    if (image) {
      wrapper.parentNode.insertBefore(image, wrapper);
    }
    wrapper.remove();
  });
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}