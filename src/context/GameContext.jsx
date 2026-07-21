import { createContext, useState } from 'react';
import { getConfig, getToken } from '../aggregator/api.js';

export const GameContext = createContext();

const GameContextProvidor = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState('');

  // Operator URL / game selection (localStorage)
  const [config, setConfig] = useState(getConfig());

  // Logged-in player
  const [auth, setAuth] = useState({ token: getToken(), user: null });

  // Player account snapshot (me()): { username, balance, currency, ... }
  const [account, setAccount] = useState(null);

  // Active launch session + latest slotInfo
  const [session, setSession] = useState({ token: '', socketUrl: '' });
  const [slotInfo, setSlotInfo] = useState(null);

  // UI: auth modal (false | 'login' | 'register'), wallet modal (bool), sidebar
  const [authModal, setAuthModal] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <GameContext.Provider
      value={{
        isConnected, setIsConnected,
        socketId, setSocketId,
        config, setConfig,
        auth, setAuth,
        account, setAccount,
        session, setSession,
        slotInfo, setSlotInfo,
        authModal, setAuthModal,
        walletOpen, setWalletOpen,
        sidebarOpen, setSidebarOpen,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContextProvidor;
