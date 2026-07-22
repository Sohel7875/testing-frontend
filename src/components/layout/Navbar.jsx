import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Wallet, User, LogOut, Dice5 } from 'lucide-react';
import { GameContext } from '../../context/GameContext';
import { logout, getToken } from '../../aggregator/api.js';

const Navbar = () => {
  const {
    account, setAuth, setAccount, setAuthModal, setWalletOpen,
    sidebarOpen, setSidebarOpen,
  } = useContext(GameContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const loggedIn = !!getToken();

  const runSearch = () => navigate(`/?q=${encodeURIComponent(search.trim())}`);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => {
    logout();
    setAuth({ token: '', user: null });
    setAccount(null);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-stake-800 border-b border-stake-600 flex items-center gap-3 px-3 sm:px-4">
      {/* left: hamburger + logo */}
      <button
        onClick={() => setSidebarOpen((s) => !s)}
        className="w-9 h-9 shrink-0 rounded hover:bg-stake-700 flex items-center justify-center text-stake-text"
        aria-label="Toggle sidebar">
        <Menu className="w-5 h-5" />
      </button>

      <button onClick={() => navigate('/')} className="flex items-center gap-2 shrink-0">
        <span className="text-2xl">🎰</span>
        <span className="hidden sm:block font-extrabold text-white text-lg tracking-tight">Slot<span className="text-stake-green"> Play</span></span>
      </button>

      {/* center: Casino (only casino in this platform) */}
      <nav className="hidden md:flex items-center gap-1 ml-2 bg-stake-900 rounded-full p-1">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-stake-600 text-white">
          <Dice5 className="w-4 h-4" /> Casino
        </button>
      </nav>

      {/* search — Enter (or the icon) jumps to the filtered lobby */}
      <div className="flex-1 max-w-md hidden lg:flex items-center gap-2 bg-stake-900 rounded-full px-4 h-10 mx-2">
        <button onClick={runSearch} aria-label="Search"><Search className="w-4 h-4 text-stake-text hover:text-white" /></button>
        <input placeholder="Search games"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') runSearch(); }}
          className="bg-transparent outline-none text-sm text-white placeholder:text-stake-500 w-full" />
      </div>

      <div className="flex-1 lg:hidden" />

      {/* right */}
      {loggedIn ? (
        <div className="flex items-center gap-2 shrink-0">
          {/* balance pill */}
          <div className="flex items-center gap-2 bg-stake-900 rounded-md h-10 pl-3 pr-1">
            <span className="text-white font-bold text-sm tabular-nums">
              {account ? Number(account.balance).toLocaleString() : '—'}
            </span>
            <span className="text-stake-coin text-xs font-semibold">{account?.currency || 'USD'}</span>
            <button onClick={() => setWalletOpen(true)}
              className="ml-1 h-8 px-3 rounded bg-stake-green hover:bg-stake-greenh text-stake-900 text-sm font-bold flex items-center gap-1">
              <Wallet className="w-4 h-4" /> <span className="hidden sm:inline">Wallet</span>
            </button>
          </div>

          {/* profile */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen((m) => !m)}
              className="h-10 w-10 rounded-full bg-stake-700 hover:bg-stake-600 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-stake-800 border border-stake-600 rounded-lg shadow-pop py-1 animate-pop-in">
                <div className="px-4 py-3 border-b border-stake-600">
                  <div className="text-xs text-stake-text">Signed in as</div>
                  <div className="text-white font-semibold truncate">{account?.username || 'player'}</div>
                </div>
                <button onClick={() => { setWalletOpen(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-stake-text hover:bg-stake-700 hover:text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Wallet
                </button>
                <button onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-stake-text hover:bg-stake-700 hover:text-white flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setAuthModal('login')}
            className="h-10 px-4 rounded text-sm font-bold text-white hover:bg-stake-700">
            Sign In
          </button>
          <button onClick={() => setAuthModal('register')}
            className="h-10 px-4 rounded text-sm font-bold bg-stake-green hover:bg-stake-greenh text-stake-900">
            Register
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
