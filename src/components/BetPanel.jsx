import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "../context/GameContext";
import { getSocket } from "../socket/connect";

const BetPanel = ({
  gameId,
  selectedBet,
  setSelectedBet,
  coinMultiplier,
  onClose,
  betSize,
  setBetSize,
  betLevel,
  setBetLevel,
}) => {
  const { isConnected } = useContext(GameContext);

  const [mode, setMode] = useState("values");
  const [betValues, setBetValues] = useState([]);

  const [sizes, setSizes] = useState([]);   // backend values
  const [levels, setLevels] = useState([]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const [loading, setLoading] = useState(true);

  const handleGetBetValues = () => {
    const socket = getSocket();
    if (!socket || !isConnected) return;

    socket.emit("to_bet_info", gameId);
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleBetResult = (data) => {
      if (data?.type === "values") {
        setMode("values");
        const normalized = [...new Set(data.betValues)].sort((a, b) => a - b);
        setBetValues(normalized);
      } 
      
      else if (data?.type === "matrix") {
        setMode("matrix");
        setSizes(data.betSize);
        setLevels(data.betLevel);
      }

      setLoading(false);
    };

    socket.on("on_bet_info", handleBetResult);
    return () => socket.off("on_bet_info", handleBetResult);
  }, []);

  useEffect(() => {
    handleGetBetValues();
  }, [isConnected]);

  const formatBet = (bet) => {
    // const value = bet * coinMultiplier;
    const value = bet
    return Number.isInteger(value) ? value : value.toFixed(2);
  };

  // ✅ FINAL BET CALCULATION
  useEffect(() => {
    if (mode === "matrix" && selectedSize && selectedLevel) {
      const finalBet = selectedSize * selectedLevel;
      setSelectedBet(finalBet);
    }
  }, [selectedSize, selectedLevel]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-96 max-w-[90%] p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center mb-4">
          Select Your Bet
        </h2>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : mode === "values" ? (
          <div className="flex flex-wrap gap-3 justify-center">
            {betValues.map((bet, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedBet(bet)}
                className={`px-4 py-2 rounded-full border ${
                  selectedBet === bet
                    ? "bg-green-500 text-white"
                    : "bg-black-200 border"
                }`}
              >
                {formatBet(bet)}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">

            {/* SIZE */}
            <div>
              <p className="mb-2">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedSize(size);
                      setBetSize(size);   // ✅ parent update
                    }}
                    className={`px-3 py-1 rounded ${
                      selectedSize === size
                        ? "bg-blue-500 text-white"
                        : "bg-black-200 border"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* LEVEL */}
            <div>
              <p className="mb-2">Select Level</p>
              <div className="flex flex-wrap gap-2">
                {levels.map((level, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedLevel(level);
                      setBetLevel(level); // ✅ parent update
                    }}
                    className={`px-3 py-1 rounded ${
                      selectedLevel === level
                        ? "bg-purple-500 text-white"
                        : "bg-black-200 border"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* PREVIEW */}
            {selectedSize && selectedLevel && (
              <div className="text-center text-green-600 font-semibold">
                Bet: {formatBet(selectedSize * selectedLevel)}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            disabled={mode === "matrix" && (!selectedSize || !selectedLevel)}
            className="bg-green-500 text-white px-6 py-2 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetPanel;