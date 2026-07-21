import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GameContext } from '../context/GameContext';
import { launchGame, saveConfig, getToken } from '../aggregator/api.js';
import { initializeSocket } from '../socket/connect';

/**
 * Reuses the exact, proven Lobby launch flow:
 *   launchGame(code) -> { token, socketUrl } -> socket -> on 'slotInfo' -> /slot-machine
 * If the player isn't logged in, opens the auth modal instead of launching.
 */
export default function useLaunch() {
  const { setIsConnected, setSocketId, setSession, setSlotInfo, setAuthModal } =
    useContext(GameContext);
  const [launching, setLaunching] = useState(null); // gameCode currently launching
  const navigate = useNavigate();

  const launch = async (gameCode) => {
    if (!getToken()) {
      setAuthModal('login');
      return;
    }
    setLaunching(gameCode);
    try {
      saveConfig({ gameCode });
      const { token, socketUrl } = await launchGame({ gameCode });
      setSession({ token, socketUrl });

      const socket = initializeSocket(token, socketUrl);
      if (!socket) throw new Error('Socket init failed');

      let navigated = false;
      socket.on('connect_ack', (data) => {
        setIsConnected(true);
        setSocketId(data.socketId);
      });
      socket.on('slotInfo', (data) => {
        setSlotInfo(data);
        if (!navigated) {
          navigated = true;
          navigate('/slot-machine', { state: { slotData: data } });
        }
      });
      socket.on('error', (msg) => toast.error(String(msg), { containerId: 'main-toast' }));
      socket.on('connect_error', () =>
        toast.error('Socket connection failed', { containerId: 'main-toast' }));
    } catch (err) {
      toast.error(err.message || 'Launch failed', { containerId: 'main-toast' });
    } finally {
      setLaunching(null);
    }
  };

  return { launch, launching };
}
