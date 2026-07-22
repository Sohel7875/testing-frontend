import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wallet, PlusCircle } from 'lucide-react';
import { GameContext } from '../../context/GameContext';

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen, setWalletOpen } = useContext(GameContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const go = (to) => { navigate(to); if (window.innerWidth < 1024) setSidebarOpen(false); };

  // Every entry does something real — no dead links.
  const CASINO = [
    { icon: Home, label: 'Lobby', onClick: () => go('/'), active: pathname === '/' || pathname === '/casino' || pathname.startsWith('/game') },
  ];
  const ACCOUNT = [
    { icon: Wallet,     label: 'Wallet',  onClick: () => setWalletOpen(true) },
    { icon: PlusCircle, label: 'Deposit', onClick: () => setWalletOpen(true) },
  ];

  const Item = ({ icon: Icon, label, onClick, active }) => (
    <button
      onClick={onClick}
      title={!sidebarOpen ? label : undefined}
      className={`w-full flex items-center gap-3 rounded-md px-3 h-10 text-sm font-medium transition-colors
        ${active ? 'bg-stake-600 text-white' : 'text-stake-text hover:bg-stake-700 hover:text-white'}
        ${sidebarOpen ? 'justify-start' : 'lg:justify-center'}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span className={sidebarOpen ? 'block' : 'hidden'}>{label}</span>
    </button>
  );

  const Heading = ({ children }) => (
    <div className={`px-3 pt-4 pb-1 text-[11px] uppercase tracking-wider text-stake-500 font-semibold
      ${sidebarOpen ? 'block' : 'hidden'}`}>{children}</div>
  );

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 top-16 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 bg-stake-800 border-r border-stake-600
          flex flex-col overflow-y-auto thin-scroll transition-all duration-200
          ${sidebarOpen ? 'w-60' : 'w-0 lg:w-[68px]'}`}>
        <div className="p-2">
          <Heading>Casino</Heading>
          {CASINO.map((i) => <Item key={i.label} {...i} />)}
          <Heading>Account</Heading>
          {ACCOUNT.map((i) => <Item key={i.label} {...i} />)}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
