import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { X, Wallet, Loader2 } from 'lucide-react';
import { GameContext } from '../context/GameContext';
import { deposit, withdraw, me } from '../aggregator/api.js';

const QUICK = [100, 500, 1000, 5000];

const WalletModal = () => {
  const { walletOpen, setWalletOpen, account, setAccount } = useContext(GameContext);
  const [amount, setAmount] = useState(1000);
  const [busy, setBusy] = useState(false);

  if (!walletOpen) return null;
  const close = () => setWalletOpen(false);

  const doDeposit = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount', { containerId: 'main-toast' });
    setBusy(true);
    try {
      const out = await deposit(amt);
      setAccount((a) => ({ ...(a || {}), balance: out.balance, currency: out.currency }));
      toast.success(`Deposited ${amt}. Balance ${out.balance} ${out.currency}`, { containerId: 'main-toast' });
    } catch (err) {
      // fall back to refetch in case the response shape differs
      try { setAccount(await me()); } catch { /* ignore */ }
      toast.error(err.message, { containerId: 'main-toast' });
    } finally {
      setBusy(false);
    }
  };

  // amount: a number, or 'all' to drain the wallet to 0 (for testing 0-balance).
  const doWithdraw = async (amt) => {
    if (amt !== 'all' && (!Number(amt) || Number(amt) <= 0))
      return toast.error('Enter a valid amount', { containerId: 'main-toast' });
    setBusy(true);
    try {
      const out = await withdraw(amt === 'all' ? 'all' : Number(amt));
      setAccount((a) => ({ ...(a || {}), balance: out.balance, currency: out.currency }));
      toast.success(`Withdrew. Balance ${out.balance} ${out.currency}`, { containerId: 'main-toast' });
    } catch (err) {
      try { setAccount(await me()); } catch { /* ignore */ }
      toast.error(err.message, { containerId: 'main-toast' });
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 animate-fade-in"
      onMouseDown={close}>
      <div className="w-full max-w-md rounded-xl bg-stake-800 shadow-pop border border-stake-600 animate-pop-in"
        onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stake-600">
          <h3 className="flex items-center gap-2 text-white font-bold">
            <Wallet className="w-5 h-5 text-stake-green" /> Wallet
          </h3>
          <button onClick={close} className="text-stake-text hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 grid gap-4">
          <div className="rounded-lg bg-stake-900 border border-stake-600 p-4 flex items-center justify-between">
            <span className="text-stake-text text-sm">Current balance</span>
            <span className="text-stake-green text-2xl font-bold">
              {account ? `${account.balance} ${account.currency || ''}` : '—'}
            </span>
          </div>

          <div>
            <span className="text-stake-text text-sm">Deposit amount</span>
            <input
              type="number" min={1} value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded bg-stake-900 border border-stake-600 text-white
                         focus:border-stake-blue outline-none"
            />
            <div className="flex gap-2 mt-2">
              {QUICK.map((q) => (
                <button key={q} onClick={() => setAmount(q)}
                  className={`flex-1 py-1.5 rounded text-sm border transition-colors ${
                    Number(amount) === q ? 'bg-stake-blue border-stake-blue text-white'
                                         : 'bg-stake-700 border-stake-600 text-stake-text hover:text-white'}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={doDeposit} disabled={busy}
              className={`py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                busy ? 'bg-stake-600 text-stake-text' : 'bg-stake-green hover:bg-stake-greenh text-stake-900'}`}>
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? '…' : 'Deposit'}
            </button>
            <button onClick={() => doWithdraw(amount)} disabled={busy}
              className={`py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                busy ? 'bg-stake-600 text-stake-text' : 'bg-stake-700 border border-stake-600 text-white hover:bg-stake-600'}`}>
              {busy ? '…' : 'Withdraw'}
            </button>
          </div>

          <button onClick={() => doWithdraw('all')} disabled={busy}
            className={`py-2 rounded font-semibold text-xs transition-colors ${
              busy ? 'bg-stake-600 text-stake-text' : 'bg-red-500/15 border border-red-500/40 text-red-300 hover:bg-red-500/25'}`}>
            Withdraw all → 0 balance (test)
          </button>
          <p className="text-[11px] text-stake-text text-center">
            Test wallet — deposits credit, withdrawals debit the operator balance used for real bets.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WalletModal;
