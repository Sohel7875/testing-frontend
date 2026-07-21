import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getTransactions, getConfig } from '../aggregator/api.js';

/** Real wallet transaction history from the operator backend. */
const HistoryPanel = () => {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const cfg = getConfig();
      const data = await getTransactions(cfg.playerId);
      setTxns(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message, { containerId: 'main-toast' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const color = (t) => (t === 'win' ? 'text-green-300' : t === 'rollback' ? 'text-yellow-300' : 'text-red-300');

  return (
    <div className="p-4 space-y-4 max-h-[510px] overflow-auto text-white">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Wallet transactions</h3>
        <button onClick={load} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">Refresh</button>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading…</div>
      ) : txns.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No transactions yet.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-gray-400 text-left">
            <tr>
              <th className="py-1">Type</th>
              <th>Amount</th>
              <th>Balance after</th>
              <th>Round</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.txnId} className="border-t border-gray-800">
                <td className={`py-1 font-semibold ${color(t.type)}`}>{t.type}</td>
                <td>{t.amount}</td>
                <td className="text-blue-300">{t.balanceAfter}</td>
                <td className="font-mono text-xs">{t.roundId || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistoryPanel;
