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

  // Poll the account to mimic a live socket: the balance changes as the player
  // bets in the game iframe (which we can't observe directly), so re-fetch it on
  // an interval — and immediately when the tab regains focus.
  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    const refresh = async () => {
      if (!getToken()) return;
      try { const a = await me(); if (alive) setAccount(a); } catch { /* transient — keep last */ }
    };
    const id = setInterval(refresh, 5000);
    const onFocus = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
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
