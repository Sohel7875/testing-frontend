import { io } from 'socket.io-client';

let socket = null;

/**
 * Connect to the aggregator game socket using a launch session token.
 * @param {string} token     session token from the launch endpoint
 * @param {string} socketUrl e.g. http://localhost:4055
 */
const initializeSocket = (token, socketUrl) => {
  if (!token) {
    console.warn('[Socket] Cannot initialize: token missing');
    return null;
  }

  if (socket && socket.connected) {
    console.log('[Socket] Already connected');
    return socket;
  }

  // Tear down any stale instance so the new token takes effect.
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  console.log('[Socket] Connecting with token to', socketUrl);
  socket = io(socketUrl, {
    transports: ['websocket'],
    query: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
  socket.on('disconnect', (reason) => console.warn('[Socket] Disconnected:', reason));
  socket.on('connect_error', (err) => console.error('[Socket] Connection error:', err.message));

  return socket;
};

const getSocket = () => socket;

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket] Manually disconnected');
  }
};

export { initializeSocket, getSocket, disconnectSocket };
