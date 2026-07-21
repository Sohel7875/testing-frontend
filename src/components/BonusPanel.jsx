import React, { useEffect, useState } from 'react';
import { getSocket } from '../socket/connect';

/**
 * Buy-bonus panel. The aggregator returns an array of bonus docs:
 *   { _id, gameCode, buyBonusId, label, description, costMultiplier }
 * onBuy(item) -> parent emits BUY_BONUS with item.buyBonusId.
 */
const BonusPanel = ({ price, onBuy }) => {
  const [bonuses, setBonuses] = useState([]);
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;
    const handle = (data) => setBonuses(Array.isArray(data) ? data : []);
    socket.on('GET_BONUS_INFO', handle);
    socket.emit('GET_BONUS_INFO', {});
    return () => socket.off('GET_BONUS_INFO', handle);
  }, [socket]);

  return (
    <div className="p-5 font-sans bg-[#282E2E] text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Buy Bonus</h2>

      {bonuses.length === 0 ? (
        <p className="text-gray-400">No bonus options configured for this game.</p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {bonuses.map((bonus) => (
            <div
              key={bonus._id || bonus.buyBonusId}
              className="rounded-xl p-4 w-[210px] text-center shadow-lg flex flex-col items-center bg-[#1F2626]"
            >
              <div className="text-lg font-bold mb-1">{bonus.label || `Bonus ${bonus.buyBonusId}`}</div>
              <div className="text-xs text-gray-400 mb-3">{bonus.description || `buy_bonus_id ${bonus.buyBonusId}`}</div>

              <div className="bg-gray-800 w-full rounded-lg py-2 mb-3">
                <p className="text-gray-300 text-sm">Cost</p>
                <p className="text-white font-bold text-lg">
                  {bonus.costMultiplier ? `${bonus.costMultiplier}× bet` : `${price ?? '?'}`}
                </p>
              </div>

              <button
                onClick={() => onBuy(bonus)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BonusPanel;
