import React, { useContext, useEffect, useRef, useState } from "react";
import { FaPlay, FaCogs, FaPowerOff, FaBolt, FaCoins, FaArrowRight, FaLaughBeam, FaFreebsd, FaForumbee, FaHistory, FaGift } from "react-icons/fa";
import { disconnectSocket, getSocket } from "../socket/connect";
import { useLocation, useNavigate } from "react-router-dom";
import { GameContext } from "../context/GameContext";
import { toast } from "react-toastify";
import iconMapping from "../assets/img";
import BetPanel from "../components/BetPanel";
import AutoPlayPanel from "../components/AutoPlayPanel";
import { PlayIcon, X } from "lucide-react";
import HistoryPanel from "../components/HistoryPanel";
import SidePanel from "../components/SidePanel";
import { FaBurger } from "react-icons/fa6";
import PickModal from "../components/PickModal";
import BonusPanel from "../components/BonusPanel";

const CELL_SIZE = 90;

const SlotMachine = () => {
    const { isConnected, setIsConnected, setSocketId } = useContext(GameContext);
    const location = useLocation();
    const slotData = location.state?.slotData;
    const navigate = useNavigate();

    console.log('Location---------------------------', location.pathname)

    const reels = slotData?.gameConfig?.reels || 6;
    const rows = slotData?.gameConfig?.rows || 5;

    const WIDTH = reels * CELL_SIZE;
    const HEIGHT = rows * CELL_SIZE;

    const [slotInfo, setSlotInfo] = useState(slotData);
    const [board, setBoard] = useState(slotData.lastBoardState || []);
    const [coinMultiplier, setCoinMultiplier] = useState(slotData.coin_multiplier)
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [selectedBet, setSelectedBet] = useState(slotInfo.lastBet || slotInfo.gameConfig?.minBet || 0.1);
    const [selectingBet, setSelectingBet] = useState(false);
    const [autoPlayingSettingOpen, setAutoPlayingSettingOpen] = useState(false);
    const [autoPlayState, setAutoPlayState] = useState(null);
    const [autoPlaying, setAutoPlaying] = useState({})
    const [nextSpin, setNextSpin] = useState('bet')
    const [isFreeSpinRound, setFreeSpinRound] = useState(false)
    const [freeSpinData, setFreeSpinData] = useState(null);

    const [isAceCoreSpinRound, setAceCoreSpinRound] = useState(false)
    const [aceCoreSpinData, setAceCoreSpinData] = useState(null);

    const [sidePanelData, setSidePanelData] = useState({
        isVisible: false,
        modalKey: 250,
        panelWidth: '40%',
        panelData: null
    })

    const [betLevel, setBetLevel] = useState(0)
    const [betSize, setBetSize] = useState(0)

    const [premiumSpinCost, setPremiumSpinCost] = useState(0)

    const [seletingPickOption, setSelectingPickOption] = useState(false)
    const canvasRef = useRef(null);
    const imageElements = useRef({});

    const socket = getSocket();

    const handleDisconnect = () => {
        disconnectSocket();
        setIsConnected(false);
        setSocketId("");
        toast.info("Disconnected", { containerId: "main-toast" });
    };



    const [autoPlayRounds, setAutoPlayRounds] = useState(null); // remaining rounds

    // AutoPlay trigger
    const handleAutoPlay = (payload) => {
        if (!socket) return toast.error("Socket not connected");

        setAutoPlaying(true);
        setAutoPlayRounds(payload.rounds);

        socket.emit("START_AUTO_PLAY", {
            gameId: slotInfo.gameId,
            game_code: slotInfo.gameCode,
            coin_value: selectedBet,
            rounds: payload.rounds,
            lossLimit: payload.lossLimit,
            winLimit: payload.winLimit,
            stopOnSpecialFeature: payload.stopOnSpecialFeature,
        });
    };

    // Play next round
    const handlePlayNextAutoPlay = () => {
        if (!socket || !autoPlaying) return;
        socket.emit("NEXT_AUTO_PLAY_ROUND", {
            gameId: slotInfo.gameId
        });
    };

    const cancelAutoPlay = () => {
        if (!socket || !autoPlaying) return;
        socket.emit("CANCEL_AUTO_PLAY", {
            gameId: slotInfo.gameId
        });
    }

    const handlePlay = () => {
        if (!socket) return toast.error("Socket not connected");
        socket.emit("play", {
            playerId: slotInfo.userId,
            gameId: slotInfo.gameId,
            coin_value: selectedBet,
            type: "bet",
            game_code: slotInfo.gameCode,
            bet_level: betLevel,
            bet_size: betSize
        });
    };

    const handlePlayPremium = () => {
        if (!socket) return toast.error("Socket not connected");
        socket.emit("PLAY_PREMIUM", {
            playerId: slotInfo.userId,
            gameId: slotInfo.gameId,
            coin_value: selectedBet,
            type: "premium_spin",
            game_code: slotInfo.gameCode,
        });
    }

    const handleFreeSpinPlay = () => {
        if (!socket) return;
        socket.emit("PLAY_FREE_SPIN_ROUND", {
            gameId: slotInfo.gameId,
            game_code: slotInfo.gameCode,
        });
    };

    const handleAceCoreSpinPlay = () => {
        if (!socket) return;
        socket.emit("PLAY_ACE_CORE_SPIN", {
            gameId: slotInfo.gameId,
            game_code: slotInfo.gameCode,
        });
    };

    const handleSendPlayerChoice = (player_choice) => {
        console.log('handleSendPlayerChoice')
        if (!socket) return;
        console.log('player_choice------------', player_choice)
        const payload = {
            player_choice,
            gameId: slotInfo.gameId
        }

        socket.emit("SEND_PICK_CHOICE", payload);
        setSelectingPickOption(false)
    }

    const handleBuyBonus = (item) => {
        console.log('buyinggg', item)
        const request = {
            game_code: slotInfo.gameCode,
            coin_value: selectedBet,
            buy_bonus_id: item?.buyBonusId,
            bet_level: betLevel,
            bet_size: betSize
        }

        socket.emit("BUY_BONUS", request)

        setSidePanelData(prev => ({
            ...prev,
            isVisible: false,
            panelData: null
        }))

    }

    // Listen play results
    const autoPlayingRef = useRef(autoPlaying);
    const autoPlayRoundsRef = useRef(autoPlayRounds);
    const freeSpinRef = useRef(isFreeSpinRound)
    const freeSpinRoundRef = useRef(freeSpinData)

    useEffect(() => {
        autoPlayingRef.current = autoPlaying;
        autoPlayRoundsRef.current = autoPlayRounds;
    }, [autoPlaying, autoPlayRounds]);

    useEffect(() => {
        freeSpinRef.current = isFreeSpinRound;
        freeSpinRoundRef.current = freeSpinData;
    }, [isFreeSpinRound, freeSpinData]);

    const autoPlayTimeoutRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        let autoPlayTimeout;

        const handlePlayResult = (data) => {
            console.log(data);
            if (!data?.state) return;

            setSlotInfo((prev) => ({
                ...prev,
                balance: data.user?.balance ?? prev.balance,
                lastBet: data.user?.lastBet ?? prev.lastBet,
            }));

            const lastBoard =
                data.state.cascadeData?.[data.state.cascadeData.length - 1]?.board ||
                data.state.board;
            setBoard(lastBoard);

            // if (data.state.winCurrency > 0) {
            //     toast.success(`🎉 You Won ${data.state.winCurrency}`, { containerId: "main-toast" });
            // }

            const next = data?.state?.nextAction === 'base' ? 'bet' : 'bonus';
            setNextSpin(next);

            if (autoPlayTimeoutRef.current) {
                clearTimeout(autoPlayTimeoutRef.current);
            }

            // autoPlayTimeoutRef.current = setTimeout(() => {
            //     if (
            //         autoPlayingRef.current &&
            //         autoPlayRoundsRef.current > 0 &&
            //         !freeSpinRef.current
            //     ) {
            //         handlePlayNextAutoPlay();
            //     } else if (
            //         freeSpinRef.current &&
            //         freeSpinRoundRef.current &&
            //         freeSpinRoundRef.current.remainingSpins > 0
            //     ) {
            //         handleFreeSpinPlay();
            //     }
            // }, 700);
        };

        const handleCompleteAutoPlay = (msg) => {
            setAutoPlaying(false);
            setAutoPlayRounds(null);
            console.log('handleCompleteAutoPlay -->>>>>', msg)
            toast.info(msg, { containerId: "main-toast" });
            clearTimeout(autoPlayTimeout);
        };

        const getAutoPlayInfo = (data) => {
            console.log('getAutoPlayInfo ->>>>>>', data);
            setAutoPlayState(data);
            setAutoPlayRounds(data?.remainingSpins);
        };

        const handleError = (msg) => {
            setAutoPlaying(false);
            setAutoPlayRounds(null);
            toast.error(msg, { containerId: "main-toast" });
        };

        const handleErrorStopNeeded = (msg) => {
            setAutoPlaying(false);
            setAutoPlayRounds(null);
            toast.error(msg, { containerId: "main-toast" });
            clearTimeout(autoPlayTimeout);
        }

        const handleFreeSpinRoundStarted = (data) => {
            console.log('free spin started ------------------------------------------------>', data)
            setFreeSpinData(data);
            setFreeSpinRound(true);

            // Pause auto play until free spins are done
            if (autoPlayingRef.current) {
                console.log("⏸️ Auto Play paused for Free Spins");
            }
        };

        const handleAceCoreSpinRoundStarted = (data) => {
            console.log('ace core spin started ----->', data)
            setAceCoreSpinData(data);
            setAceCoreSpinRound(true);

            // Pause auto play until free spins are done
            if (autoPlayingRef.current) {
                console.log("⏸️ Auto Play paused for Ace Core Spins");
            }
        };


        const handleCompleteFreeSpin = (msg) => {
            console.log('handleCompleteFreeSpin-------', msg)
            setFreeSpinRound(false);
            setFreeSpinData(null);
            toast.info(msg, { containerId: "main-toast" });

            // Resume auto play if it was active before
            if (autoPlayingRef.current && autoPlayRoundsRef.current > 0) {
                console.log("▶️ Resuming Auto Play after Free Spins");
                handlePlayNextAutoPlay();
            }
        };

        const handleFreeSpinInfo = (data) => {
            console.log('Free Spin Data --->', data)
            setFreeSpinData(data);
        }

        const handleAceCoreSpinInfo = (data) => {
            console.log('Ace Core Spin Data --->', data)
            setAceCoreSpinData(data);
        }

        const handleFreeSpinWon = (data) => {
            console.log('free spin won ----->>', data)
            toast.success(`🎉 Congratulation You Won ${data} free spins`, { containerId: "main-toast" });
        }

        const handleAceCoreSpinWon = (data) => {
            console.log('ace core spin won ----->>', data)
            toast.success(`🎉 Congratulation You Won ${data} ace core spins`, { containerId: "main-toast" });
        }

        const handleCompleteAceCoreSpin = (msg) => {
            setAceCoreSpinRound(false);
            setAceCoreSpinData(null);
            toast.info(msg, { containerId: "main-toast" });

            if (autoPlayingRef.current && autoPlayRoundsRef.current > 0) {
                handlePlayNextAutoPlay();
            }
        };

        const handlePickRequest = (data) => {
            console.log('got pick options ------------->', data)
            setSelectingPickOption(true)
        }


        const handlePickOption = (data) => {
            console.log('got pick options ------------->', data)
        }

        const handleGetPremiumFeatureInfo = (data) => {
            console.log('handleGetPremiumFeatureInfo-------------->', data)
            setPremiumSpinCost(data.premium_coin_multiplier)
        }


        //Normal Play
        socket.on("playResult", handlePlayResult);
        socket.on('error', handleError);

        //Auto Play
        socket.on('AUTO_PLAY_INFO', getAutoPlayInfo);
        socket.on("AUTO_PLAY_COMPLETED", handleCompleteAutoPlay);
        socket.on('AUTO_PLAY_ERORR_STOPPED_NEEDED', handleErrorStopNeeded)

        //Free Spin
        socket.on('FREE_SPIN_ROUND_STARTED', handleFreeSpinRoundStarted)
        socket.on('FREE_SPIN_INFO', handleFreeSpinInfo);
        socket.on('FREE_SPIN_WON', handleFreeSpinWon)
        socket.on('FREE_SPIN_COMPLETED', handleCompleteFreeSpin)



        //Ace Core Spin
        socket.on('ACE_CORE_SPIN_ROUND_STARTED', handleAceCoreSpinRoundStarted)
        socket.on('ACE_CORE_SPIN_INFO', handleAceCoreSpinInfo);
        socket.on('ACE_CORE_SPIN_WON', handleAceCoreSpinWon)
        socket.on('ACE_CORE_SPIN_COMPLETED', handleCompleteAceCoreSpin)


        //Pick
        socket.on('GET_PICK_REQUEST', handlePickRequest)
        socket.on('GET_PICK_OPTION', handlePickOption)

        //premium feature
        socket.on('GET_PREMIUM_SPIN_COST', handleGetPremiumFeatureInfo)
        socket.emit('GET_PREMIUM_SPIN_COST', { gameId: slotInfo.gameId })

        return () => {
            socket.off("playResult", handlePlayResult);
            socket.off("AUTO_PLAY_COMPLETED", handleCompleteAutoPlay);
            socket.off('AUTO_PLAY_INFO', getAutoPlayInfo);
            socket.off('error', handleError);
            socket.off('AUTO_PLAY_ERORR_STOPPED_NEEDED', handleErrorStopNeeded)
            socket.off('FREE_SPIN_ROUND_STARTED', handleFreeSpinRoundStarted)
            socket.off('FREE_SPIN_INFO', handleFreeSpinInfo);
            socket.off('FREE_SPIN_WON', handleFreeSpinWon)
            socket.off('FREE_SPIN_COMPLETED', handleCompleteFreeSpin)
            socket.off('GET_PICK_REQUEST', handlePickRequest)
            socket.off('GET_PICK_OPTION', handlePickOption)
            socket.off('GET_PREMIUM_SPIN_COST', handleGetPremiumFeatureInfo)

            socket.off('ACE_CORE_SPIN_ROUND_STARTED', handleAceCoreSpinRoundStarted)
            socket.off('ACE_CORE_SPIN_INFO', handleAceCoreSpinInfo);
            socket.off('ACE_CORE_SPIN_WON', handleAceCoreSpinWon)
            socket.off('ACE_CORE_SPIN_COMPLETED', handleCompleteAceCoreSpin)
            clearTimeout(autoPlayTimeout);
            if (autoPlayTimeoutRef.current) {
                clearTimeout(autoPlayTimeoutRef.current);
            }
        };
    }, [socket]);


    // Redirect if disconnected
    useEffect(() => {
        if (!isConnected) {
            toast.warning("You are not connected. Redirecting...", { containerId: "main-toast" });
            navigate("/lobby");
        }
    }, [isConnected, navigate]);


    // Load icons
    useEffect(() => {
        const loadImages = async () => {
            const imgs = {};
            await Promise.all(
                Object.entries(iconMapping).map(([id, src]) => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.src = src;
                        img.onload = () => {
                            imgs[Number(id)] = img;
                            resolve();
                        };
                    });
                })
            );
            imageElements.current = imgs;
            setImagesLoaded(true);
        };
        loadImages();
    }, []);

    // Draw board
    useEffect(() => {
        if (!canvasRef.current || !imagesLoaded) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < board.length; col++) {
                const symbolId = board[col]?.[row];
                const img = imageElements.current[symbolId];
                if (!img) continue;
                ctx.drawImage(img, col * CELL_SIZE + 8, row * CELL_SIZE + 8, CELL_SIZE - 16, CELL_SIZE - 16);
            }
        }
    }, [board, imagesLoaded, reels, rows]);

    if (!slotInfo) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
                <div className="text-white text-xl font-semibold animate-pulse">
                    🎰 Loading Game...
                </div>
            </div>
        );
    }

    return (
        <div
            className={`w-full h-screen flex px-6 py-6 transition-all duration-700 ${isFreeSpinRound
                ? "bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600"
                : isAceCoreSpinRound
                    ? "bg-gradient-to-br from-yellow-700 via-orange-600 to-red-600"
                    : "bg-gradient-to-br from-gray-900 via-black to-gray-800"
                }`}
        >
            {/* Slot Canvas */}
            <div
                className={`flex-1 flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg transition-all duration-700 ${isFreeSpinRound
                    ? "bg-black/40 border-2 border-indigo-400"
                    : isAceCoreSpinRound
                        ? "bg-black/40 border-2 border-orange-400"
                        : "bg-black border-yellow-500/40"
                    }`}
            >
                <canvas
                    ref={canvasRef}
                    width={WIDTH}
                    height={HEIGHT}
                    className={`rounded-lg shadow-xl transition-all duration-700 ${isFreeSpinRound ? "border-2 border-indigo-300" : "border-2 border-yellow-400"
                        }`}
                />
            </div>

            {/* Right Panel */}
            <div className="w-80 flex flex-col justify-between ml-6">
                {/* Player Info */}
                <div
                    className={`p-5 rounded-2xl shadow-lg transition-all duration-700 ${isFreeSpinRound
                        ? "bg-black/50 border border-indigo-400 text-indigo-200"
                        : isAceCoreSpinRound
                            ? "bg-black/50 border border-orange-400 text-orange-200"
                            : "bg-gray-950 text-white border border-gray-700"
                        }`}
                >
                    <h2
                        className={`text-lg font-bold mb-2 ${isFreeSpinRound ? "text-indigo-200" : "text-yellow-400"
                            }`}
                    >{slotInfo.gameName}</h2>
                    <div>👤 Player: <span className="text-yellow-300">{slotInfo.username || slotInfo.operatorPlayerId}</span></div>
                    <div></div>
                    <div>💰 Bet: <span className="text-green-400">{(Number(selectedBet || 0) * Number(coinMultiplier || 0)).toFixed(1)}</span></div>
                    <div>🏦 Balance: <span className="text-blue-400">{slotInfo.balance?.toLocaleString()} {slotInfo.currency || ''}</span></div>
                </div>

                {/* Controls */}
                <div>
                    {
                        isFreeSpinRound ?
                            <div className="bg-gradient-to-br from-purple-700 to-indigo-600 text-white p-6 rounded-2xl shadow-2xl space-y-4 border border-indigo-400">
                                <h2 className="text-2xl font-extrabold text-center text-white drop-shadow-lg">
                                    🎁 Free Spins!
                                </h2>

                                {freeSpinData && (
                                    <div className="space-y-1 text-base text-indigo-100">
                                        <div>🔄 Remaining: <span className="font-bold">{freeSpinData.remainingSpins}</span></div>
                                        <div>🎯 Rounds: {freeSpinData.totalRounds}</div>
                                        <div>💵 Won: <span className="text-green-300">{freeSpinData.totalWon}</span></div>
                                        <div>📉 Lost: <span className="text-red-300">{freeSpinData.totalLost}</span></div>
                                        <div>🎲 Bet: <span className="text-indigo-200">{freeSpinData.coin_value}</span></div>
                                    </div>
                                )}

                                <button
                                    onClick={handleFreeSpinPlay}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl flex items-center justify-center space-x-2 text-lg font-bold shadow-lg"
                                >
                                    <FaPlay /> <span>Play</span>
                                </button>
                            </div> :
                            isAceCoreSpinRound ? (

                                <div className="bg-gradient-to-br from-orange-600 to-red-600 text-white p-6 rounded-2xl shadow-2xl space-y-4 border border-orange-400 animate-pulse">
                                    <h2 className="text-2xl font-extrabold text-center drop-shadow-lg">
                                        ⚡ Ace Core Spins
                                    </h2>

                                    {aceCoreSpinData && (
                                        <div className="space-y-1 text-base text-orange-100">
                                            <div>🔄 Remaining: <b>{aceCoreSpinData.remainingSpins}</b></div>
                                            <div>🎯 Rounds: {aceCoreSpinData.totalRounds}</div>
                                            <div>💵 Won: <span className="text-green-300">{aceCoreSpinData.totalWon}</span></div>
                                            <div>📉 Lost: <span className="text-red-300">{aceCoreSpinData.totalLost}</span></div>
                                            <div>🎲 Bet: {aceCoreSpinData.coin_value}</div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleAceCoreSpinPlay}
                                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl flex items-center justify-center gap-2 font-bold"
                                    >
                                        <FaBolt /> Spin Now
                                    </button>
                                </div>

                            )
                                : autoPlaying && autoPlayRounds > 0 ? <div className="space-y-3 mt-6">
                                    <button
                                        onClick={handlePlayNextAutoPlay}
                                        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-semibold">
                                        <FaArrowRight /> <span>Next</span>
                                    </button>

                                    <button
                                        onClick={cancelAutoPlay}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-semibold"
                                    >
                                        <X size={20} /> Cancel
                                    </button>

                                </div> : <div className="space-y-3 mt-6">
                                    {
                                        premiumSpinCost ? <button
                                            onClick={handlePlayPremium}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-semibold"
                                        >
                                            <FaPlay /> <span>Play Premium Spim {premiumSpinCost * selectedBet}</span>
                                        </button> : null
                                    }

                                    <button
                                        onClick={handlePlay}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-semibold"
                                    > <PlayIcon /></button>

                                    <button
                                        onClick={() => setAutoPlayingSettingOpen(true)}
                                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-semibold"
                                    >
                                        <FaBolt /> <span>Auto Play</span>
                                    </button>

                                    <button
                                        onClick={() => setSelectingBet(true)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-semibold"
                                    >
                                        <FaCoins /> <span>Change Bet</span>
                                    </button>
                                    <button
                                        onClick={handleDisconnect}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-semibold"
                                    >
                                        <FaPowerOff /> <span>Quit</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const data = <BonusPanel
                                                price={selectedBet * slotData.bonus_coin_multiplier}
                                                onBuy={(item) => handleBuyBonus(item)}
                                                gameId={slotInfo.gameId} />
                                            setSidePanelData(prev => (
                                                {
                                                    ...prev,
                                                    modalKey: prev.modalKey + 1,
                                                    panelData: data,
                                                    isVisible: true,
                                                }))
                                        }}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl flex items-center justify-center space-x-2 font-semibold"
                                    >
                                        <FaGift /> <span>Buy Bonus</span>
                                    </button>
                                </div>
                    }



                </div>


                <button
                    onClick={() => {
                        let data = <HistoryPanel gameCode={slotInfo.gameCode} />
                        setSidePanelData((prev) => ({
                            ...prev,
                            modalKey: prev.modalKey + 1,
                            panelData: data,
                            isVisible: true,

                        }))
                    }}
                    className="absolute left-10 flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-xl shadow-md hover:bg-gray-700 transition">
                    <FaHistory className="text-lg" />
                    <span className="text-base font-medium">History</span>
                </button>
            </div>

            {
                autoPlaying && autoPlayState && (
                    <div className="absolute top-4 left-1 w-[180px] bg-gray-900 text-white p-4 rounded-xl border border-yellow-500 shadow-lg space-y-2 z-50">
                        <h3 className="text-lg font-bold text-yellow-400">⚡ Auto Play</h3>
                        <div>▶ Spins Left: <span className="text-green-400">{autoPlayState.remainingSpins}</span></div>
                        <div>🎯 Rounds: <span className="text-blue-400">{autoPlayState.totalRounds}</span></div>
                        <div>💵 Won: <span className="text-green-300">{autoPlayState.totalWon}</span></div>
                        <div>📉 Lost: <span className="text-red-400">{autoPlayState.totalLost}</span></div>
                        <div>🎲 Bet: <span className="text-purple-400">{autoPlayState.coin_value}</span></div>
                        <div>🔄 Next: <span className="text-cyan-400">{autoPlayState.next_bet_type}</span></div>
                    </div>
                )
            }

            {
                selectingBet && (
                    <BetPanel
                        gameId={slotInfo.gameId}
                        selectedBet={selectedBet}
                        coinMultiplier={coinMultiplier}
                        betSize={betSize}
                        setBetSize={setBetSize}
                        betLevel={betLevel}
                        setBetLevel={setBetLevel}
                        setSelectedBet={setSelectedBet}

                        onClose={() => setSelectingBet(false)}
                    />
                )
            }

            {
                autoPlayingSettingOpen && (
                    <AutoPlayPanel
                        onClose={() => setAutoPlayingSettingOpen(false)}
                        selectedBet={selectedBet}
                        coinMultiplier={coinMultiplier}
                        handleAutoPlay={handleAutoPlay}
                    />
                )
            }

            {
                seletingPickOption && <PickModal
                    handlePick={(data) => handleSendPlayerChoice(data)}
                />
            }



            <SidePanel
                key={sidePanelData.modalKey}
                isOpen={sidePanelData.isVisible}
                width={sidePanelData.panelWidth}
                children={sidePanelData.panelData}
                onClose={() => setSidePanelData(prev => ({
                    ...prev,
                    isVisible: false,
                    panelData: null
                }))}
            />


        </div >
    );
};

export default SlotMachine;
