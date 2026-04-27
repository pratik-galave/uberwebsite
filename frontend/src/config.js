export const BASE_URL = (import.meta.env.VITE_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BASE_URL;
