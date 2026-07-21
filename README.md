# Operator Frontend (test client)

React + Vite frontend for a real operator. Players **sign up / log in** (JWT),
**deposit**, and **play**. It talks only to the **operator backend** — no aggregator
keys, no signing in the browser.

## Prerequisites

Run, in order: **slot-aggregator** (`:4000`/`:4055`) → **operator-backend** (`:5000`,
MongoDB) → this frontend. See `../operator-backend/README.md`.

```bash
nvm use 22.16.0        # Vite 7 needs Node >= 20.19
npm install
npm run dev
```

## Flow

1. **Sign up / Sign in** (operator backend `/api/auth/*`) → JWT stored locally.
2. **Lobby** — shows the player's real wallet balance; **Deposit +1000**; pick a game.
3. **Play** → `POST /api/launch` (with JWT) → operator signs + asks the aggregator for
   a token → frontend connects the game socket with `?token=`.
4. Spins debit/credit the **real operator wallet** (MongoDB). History shows the ledger.

## Key files

- `src/aggregator/api.js` — operator backend client (JWT auth, launch, deposit, txns)
- `src/screens/Auth.jsx` — login / signup
- `src/screens/Lobby.jsx` — balance, deposit, game select, Play
- `src/screens/SlotMachine.jsx` — the game (socket events unchanged)
- `src/socket/connect.js` — token-based socket connect
- `src/components/HistoryPanel.jsx` — real wallet transactions

No aggregator keys live in the browser; the operator backend holds them.
