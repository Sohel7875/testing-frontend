import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { X, Loader2 } from 'lucide-react';
import { GameContext } from '../context/GameContext';
import { login, signup, me } from '../aggregator/api.js';

const Field = ({ label, ...props }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-stake-text">{label}</span>
    <input
      className="px-3 py-2.5 rounded bg-stake-900 border border-stake-600 text-white text-sm
                 focus:border-stake-blue outline-none placeholder:text-stake-500"
      {...props}
    />
  </label>
);

const AuthModal = () => {
  const { authModal, setAuthModal, setAuth, setAccount } = useContext(GameContext);
  const mode = authModal; // 'login' | 'register' | false
  const [form, setForm] = useState({ username: '', email: '', password: '', usernameOrEmail: '' });
  const [busy, setBusy] = useState(false);

  if (!mode) return null;
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const close = () => setAuthModal(false);

  const submit = async () => {
    setBusy(true);
    try {
      const out = mode === 'login'
        ? await login({ usernameOrEmail: form.usernameOrEmail, password: form.password })
        : await signup({ username: form.username, email: form.email, password: form.password });
      setAuth({ token: out.token, user: out.user });
      try { setAccount(await me()); } catch { setAccount(out.user); }
      toast.success(`Welcome, ${out.user?.username || 'player'}`, { containerId: 'main-toast' });
      close();
    } catch (err) {
      toast.error(err.message, { containerId: 'main-toast' });
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 animate-fade-in"
      onMouseDown={close}>
      <div
        className="w-full max-w-md rounded-xl bg-stake-800 shadow-pop border border-stake-600 animate-pop-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* tabs */}
        <div className="flex items-center border-b border-stake-600">
          <button
            onClick={() => setAuthModal('login')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              mode === 'login' ? 'text-white border-b-2 border-stake-blue' : 'text-stake-text hover:text-white'}`}>
            Sign In
          </button>
          <button
            onClick={() => setAuthModal('register')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              mode === 'register' ? 'text-white border-b-2 border-stake-blue' : 'text-stake-text hover:text-white'}`}>
            Register
          </button>
          <button onClick={close} className="px-4 text-stake-text hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* body */}
        <div className="p-6 grid gap-3" onKeyDown={onKey}>
          {mode === 'register' ? (
            <>
              <Field label="Username" value={form.username} onChange={upd('username')} placeholder="yourname" />
              <Field label="Email" type="email" value={form.email} onChange={upd('email')} placeholder="you@email.com" />
              <Field label="Password" type="password" value={form.password} onChange={upd('password')} placeholder="••••••••" />
            </>
          ) : (
            <>
              <Field label="Username or Email" value={form.usernameOrEmail} onChange={upd('usernameOrEmail')} placeholder="yourname" />
              <Field label="Password" type="password" value={form.password} onChange={upd('password')} placeholder="••••••••" />
            </>
          )}

          <button
            onClick={submit}
            disabled={busy}
            className={`mt-2 py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              busy ? 'bg-stake-600 text-stake-text' : 'bg-stake-green hover:bg-stake-greenh text-stake-900'}`}>
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-xs text-stake-text mt-1">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              onClick={() => setAuthModal(mode === 'login' ? 'register' : 'login')}
              className="text-stake-blue hover:underline font-semibold">
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
