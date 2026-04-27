export const BASE_URL = (() => {
  let url = (import.meta.env.VITE_BASE_URL || 'http://localhost:4000').trim().replace(/\/+$/, '');
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
})();

export const SOCKET_URL = (() => {
  let url = import.meta.env.VITE_SOCKET_URL;
  if (!url) return BASE_URL;
  url = url.trim().replace(/\/+$/, '');
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('ws://') && !url.startsWith('wss://')) {
    url = 'https://' + url;
  }
  return url;
})();
