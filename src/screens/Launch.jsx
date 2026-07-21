import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';
import { saveConfig, getConfig, launchGame, getPlayer, topup } from '../aggregator/api.js';
import { initializeSocket } from '../socket/connect';

const GAME_CODES = [
  'duck_hunt_96',
  'celestial_guardians_96',
  'super_ace_96',
  'angliam_bayan_96',
  'crazy_emoji_96',
];

const Field = ({ label, ...props }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="text-gray-300">{label}</span>
    <input
      className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:border-green-500 outline-none"
      {...props}
    />
  </label>
);

const Launch = () => {
  const { setIsConnected, setSocketId, setConfig, setSession, setSlotInfo } = useContext(GameContext);
  const [form, setForm] = useState(getConfig());
  const [balance, setBalance] = useState(null);
  const [busy, setBusy] = useState(false); 
  const navigate = useNavigate();

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const refreshBalance = async (cfg = form) => {
    try {
      saveConfig(cfg);
      const p = await getPlayer(cfg.playerId);
      setBalance(p);
    } catch {
      setBalance(null);
    }
  };

  useEffect(() => {
    refreshBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTopup = async () => {
    try {
      const p = await topup(form.playerId, 1000);
      setBalance(p);
      toast.success(`Topped up. Balance ${p.balance} ${p.currency}`, { containerId: 'main-toast' });
    } catch (err) {
      toast.error(err.message, { containerId: 'main-toast' });
    }
  };

  const handleLaunch = async () => {
    setBusy(true);
    try {
      const cfg = saveConfig(form);
      setConfig(cfg);

      // 1. Operator backend launches (it signs + calls the aggregator).
      const { token, socketUrl } = await launchGame({
        playerId: cfg.playerId,
        gameCode: cfg.gameCode,
        currency: cfg.currency,
      });
      setSession({ token, socketUrl });
      toast.success('Launched', { containerId: 'main-toast' });

      // 2. Connect the game socket with the token.
      const socket = initializeSocket(token, socketUrl);
      if (!socket) throw new Error('Socket init failed');

      let navigated = false;
      socket.on('connect_ack', (data) => {
        setIsConnected(true);
        setSocketId(data.socketId);
      });
      socket.okn('slotInfo', (data) => {
        setSlotInfo(data);
        if (!navigated) {
          navigated = true;
          navigate('/slot-machine', { state: { slotData: data } });
        }
      });
      socket.on('error', (msg) => toast.error(String(msg), { containerId: 'main-toast' }));
      socket.on('connect_error', () => toast.error('Socket connection failed', { containerId: 'main-toast' }));
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Launch failed', { containerId: 'main-toast' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center py-10 px-4 font-mono">
      <h1 className="text-3xl font-bold text-yellow-400 mb-1">🎰 Operator Lobby</h1>
      <p className=" text-sm mb-6">Operator frontend → operator backend launches the game (no keys in the browser).</p>

      <div className="w-full max-w-xl grid grid-cols-1 gap-3 bg-gray-950/60 border border-gray-800 rounded-2xl p-6">
        <Field label="Operator Backend URL" value={form.operatorUrl} onChange={upd('operatorUrl')} placeholder="http://localhost:5000" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Player ID" value={form.playerId} onChange={upd('playerId')} onBlur={() => refreshBalance()} />
          <Field label="Currency" value={form.currency} onChange={upd('currency')} />
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-300">Game</span>
          <select
            className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white outline-none"
            value={form.gameCode}
            onChange={upd('gameCode')}
          >
            {GAME_CODES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>

        <div className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3 mt-1">
          <span className="text-gray-300">
            Real balance:{' '}
            <span className="text-green-400 font-bold">
              {balance ? `${balance.balance} ${balance.currency}` : '—'}
            </span>
          </span>
          <div className="flex gap-2">
            <button onClick={() => refreshBalance()} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">Refresh</button>
            <button onClick={handleTopup} className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm">+1000</button>
          </div>
        </div>

        <button
          onClick={handleLaunch}
          disabled={busy}
          className={`mt-2text-gray-400 py-3 rounded-md text-lg font-semibold ${busy ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {busy ? 'Launching…' : 'Play'}
        </button>
      </div>
    </div>
  );
};

export default Launch;
