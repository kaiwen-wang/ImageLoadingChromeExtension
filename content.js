const images = document.getElementsByTagName('img');

for (const image of images) {
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

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
