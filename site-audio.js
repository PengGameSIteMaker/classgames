(() => {
  const SETTINGS_KEY = 'gameRoomSettings';

  function readSettings() {
    try {
      return {
        showDailyPick: true,
        animateLights: true,
        rememberSearch: false,
        muteSite: false,
        ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
      };
    } catch {
      return {
        showDailyPick: true,
        animateLights: true,
        rememberSearch: false,
        muteSite: false
      };
    }
  }

  function siteIsMuted() {
    return readSettings().muteSite === true;
  }

  function applyMute(media) {
    if (media instanceof HTMLMediaElement) {
      media.muted = siteIsMuted();
      return;
    }

    if (media instanceof Element) {
      if (media.matches?.('ruffle-player, ruffle-embed, object, embed')) {
        if ('muted' in media) media.muted = siteIsMuted();
        if ('volume' in media) {
          try {
            media.volume = siteIsMuted() ? 0 : (media.__gameRoomVolume ?? 1);
          } catch {
            // no-op: some embedded players do not support a JS volume property
          }
        }
        if (media.instance && typeof media.instance.set_volume === 'function') {
          const volume = Number(media.__gameRoomVolume ?? 100);
          media.instance.set_volume(siteIsMuted() ? 0 : volume / 100);
        }
      }
    }
  }

  function applyToAllMedia() {
    document.querySelectorAll('audio, video, ruffle-player, ruffle-embed, object, embed').forEach(applyMute);
  }

  applyToAllMedia();

  window.addEventListener('gameRoomSettingsChanged', applyToAllMedia);

  new MutationObserver(records => {
    for (const { addedNodes } of records) {
      for (const node of addedNodes) {
        applyMute(node);
        node.querySelectorAll?.('audio, video, ruffle-player, ruffle-embed, object, embed').forEach(applyMute);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('storage', event => {
    if (event.key === SETTINGS_KEY) applyToAllMedia();
  });
})();