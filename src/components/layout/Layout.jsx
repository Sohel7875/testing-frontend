import { useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AuthModal from '../AuthModal';
import WalletModal from '../WalletModal';
import { GameContext } from '../../context/GameContext';
import { me, getToken, logout } from '../../aggregator/api.js';

const Layout = () => {
  const { sidebarOpen, auth, setAuth, account, setAccount } = useContext(GameContext);

  // Hydrate the player account whenever we hold a token but have no snapshot yet.
  useEffect(() => {
    if (!getToken() || account) return;
    (async () => {
      try {
        setAccount(await me());
      } catch {
        logout();
        setAuth({ token: '', user: null });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);

  return (
    <div className="min-h-screen bg-stake-900 text-white">
      <Navbar />
      <Sidebar />
      <main className={`transition-all duration-200 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-[68px]'}`}>
        <Outlet />
      </main>
      <AuthModal />
      <WalletModal />
    </div>
  );
};

export default Layout;
