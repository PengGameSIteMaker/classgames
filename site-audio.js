(() => {
  function siteIsMuted() {
    try {
      return JSON.parse(localStorage.getItem('gameRoomSettings') || '{}').muteSite === true;
    } catch {
      return false;
    }
  }

  function applyMute(media) {
    if (media instanceof HTMLMediaElement) media.muted = siteIsMuted();
  }

  function applyToAllMedia() {
    document.querySelectorAll('audio, video').forEach(applyMute);
  }

  applyToAllMedia();

  new MutationObserver(records => {
    for (const { addedNodes } of records) {
      for (const node of addedNodes) {
        applyMute(node);
        node.querySelectorAll?.('audio, video').forEach(applyMute);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('storage', event => {
    if (event.key === 'gameRoomSettings') applyToAllMedia();
  });
})();