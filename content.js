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
    const imageUrl = image.src;

    const imageId = Math.random().toString(36).substring(2, 15);
    image.setAttribute('data-image-id', imageId);

    if (imageUrl.startsWith('data:')) {
      const size = getBase64ImageSize(imageUrl);
      createOverlay(image, size, imageId);
    } else {
      chrome.runtime.sendMessage({ action: 'getImageSize', url: imageUrl }, (response) => {
        if (response.error) {
          console.error(response.error);
          return;
        }
        createOverlay(image, response.size, imageId);
      });
    }
  }
}

function createOverlay(image, size, imageId) {
  const formattedSize = formatBytes(size);
  const dimensions = `${image.naturalWidth} x ${image.naturalHeight}`;

  const overlay = document.createElement('div');
  overlay.className = 'image-size-overlay';
  overlay.setAttribute('data-image-id', imageId);

  const sizeText = document.createElement('span');
  sizeText.textContent = formattedSize;

  const dimensionsText = document.createElement('span');
  dimensionsText.className = 'image-dimensions';
  dimensionsText.textContent = dimensions;

  overlay.appendChild(sizeText);
  overlay.appendChild(dimensionsText);

  document.body.appendChild(overlay);
  positionOverlay(image, overlay);

  window.addEventListener('resize', () => positionOverlay(image, overlay));
  window.addEventListener('scroll', () => positionOverlay(image, overlay));
}

function positionOverlay(image, overlay) {
  const rect = image.getBoundingClientRect();
  overlay.style.left = `${rect.left + window.scrollX + 5}px`;
  overlay.style.top = `${rect.bottom + window.scrollY - 25}px`;
}

function removeImageOverlays() {
  const overlays = document.querySelectorAll('.image-size-overlay');
  overlays.forEach(overlay => overlay.remove());
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getBase64ImageSize(dataUrl) {
  const head = 'data:image';
  const i = dataUrl.indexOf(';base64,');
  if (i === -1) {
    return 0;
  }
  const base64 = dataUrl.substring(i + ';base64,'.length);
  const padding = (base64.match(/=/g) || []).length;
  return base64.length * 3 / 4 - padding;
}
