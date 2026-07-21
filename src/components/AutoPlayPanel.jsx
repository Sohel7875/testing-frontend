import React, { useState } from "react";
import { X } from "lucide-react";

const AutoPlayPanel = ({ onClose, handleAutoPlay, selectedBet, coinMultiplier }) => {
  const [rounds, setRounds] = useState(10);
  const [lossLimit, setLossLimit] = useState({ title: "No Limit", mul: Infinity });
  const [winLimit, setWinLimit] = useState({ title: "No Limit", mul: Infinity });
  const [stopOnFeature, setStopOnFeature] = useState(false);

  const roundOptions = [10, 25, 50, 100, 200, 500, 1000];
  const lossOptions = [
    { title: "20x bet", mul: 20 },
    { title: "50x bet", mul: 50 },
    { title: "100x bet", mul: 100 },
    { title: "200x bet", mul: 200 },
    { title: "No Limit", mul: Infinity },
  ];
  const winOptions = [
    { title: "20x bet", mul: 20 },
    { title: "50x bet", mul: 50 },
    { title: "100x bet", mul: 100 },
    { title: "200x bet", mul: 200 },
    { title: "No Limit", mul: Infinity },
  ];

  const startAutoPlay = () => {
    const payload = {
      rounds,
      lossLimit: lossLimit.mul === Infinity ? null : lossLimit.mul * selectedBet*coinMultiplier,
      winLimit: winLimit.mul === Infinity ? null : winLimit.mul * selectedBet * coinMultiplier,
      stopOnSpecialFeature: stopOnFeature,
    };
    handleAutoPlay(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-96 max-w-[90%] relative overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">⚡ Auto Play</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Number of Rounds */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Number of Rounds

              <span className="text-green-500 ml-1">
                ({(rounds * selectedBet * coinMultiplier).toFixed(1)})
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {roundOptions.map((num) => (
                <button
                  key={num}
                  onClick={() => setRounds(num)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition 
                  ${rounds === num
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Stop on Feature */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Stop on Special Feature
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={stopOnFeature}
                onChange={() => setStopOnFeature(!stopOnFeature)}
                className="sr-only"
              />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500 transition"></div>
              <div
                className={`absolute left-1 top-0.5 w-4 h-4 rounded-full bg-white shadow transition ${stopOnFeature ? "translate-x-5" : ""
                  }`}
              ></div>
            </label>
          </div>

          {/* Loss Limit */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Loss Limit{" "}
              {lossLimit.mul !== Infinity && (
                <span className="text-red-500">
                  ({(lossLimit.mul * selectedBet * coinMultiplier).toFixed(1)})
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {lossOptions.map((opt) => (
                <button
                  key={opt.mul}
                  onClick={() => setLossLimit(opt)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition 
                  ${lossLimit.mul === opt.mul
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                    }`}
                >
                  {opt.title}
                </button>
              ))}
            </div>
          </div>

          {/* Win Limit */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Win Limit{" "}
              {winLimit.mul !== Infinity && (
                <span className="text-green-500">
                  ({(winLimit.mul * selectedBet * coinMultiplier).toFixed(1)})
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {winOptions.map((opt) => (
                <button
                  key={opt.mul}
                  onClick={() => setWinLimit(opt)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition 
                  ${winLimit.mul === opt.mul
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                    }`}
                >
                  {opt.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={startAutoPlay}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
          >
            ▶ Start Auto Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoPlayPanel;
