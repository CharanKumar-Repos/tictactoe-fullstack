# Tic Tac Toe — Full-Stack Solution

A browser-based Tic Tac Toe application with an **Angular 17** frontend and **.NET 8 Web API** backend.

---

## Project Overview

| Layer     | Technology            |
|-----------|-----------------------|
| Frontend  | Angular 17 + TypeScript + SCSS |
| Backend   | .NET 8 Web API (C#)   |
| API Style | REST                  |
| Storage   | In-memory (ConcurrentDictionary) |
| Logging   | Serilog (console + rolling file) |
| Testing   | xUnit + FluentAssertions (backend), Jasmine/Karma (frontend) |

---

## Features Implemented

- ✅ 3×3 interactive game board
- ✅ Two Player mode and Play vs Computer mode
- ✅ Win detection (row, column, diagonal) with winning cell highlight
- ✅ Draw detection
- ✅ Move history table (move #, player, position)
- ✅ Undo last move (single move in 2P; move pair in vs Computer)
- ✅ Session-level scoreboard (X wins / O wins / Draws)
- ✅ Reset Game (clears board, keeps scoreboard)
- ✅ Reset Scoreboard
- ✅ Computer AI with priority logic (win → block → center → corner → any)
- ✅ Full server-side state management (backend is source of truth)
- ✅ Global exception handling middleware
- ✅ Structured logging via Serilog
- ✅ Swagger UI at `/swagger`

---

## Prerequisites

| Tool        | Version  |
|-------------|----------|
| .NET SDK    | 10.0+     |
| Node.js     | 18+      |
| Angular CLI | 17+      |

```bash
# Install Angular CLI if not present
npm install -g @angular/cli
```

---

## How to Run the Backend Locally

```bash
cd backend/TicTacToe.API
dotnet restore
dotnet run
```

The API starts at **http://localhost:5000**  
Swagger UI: **http://localhost:5000/swagger**  
Logs are written to `logs/tictactoe-<date>.log`

---

## How to Run the Frontend Locally

```bash
cd frontend
npm install
ng serve
```

The Angular app starts at **http://localhost:4200**

> The frontend proxies all API calls to `http://localhost:5000`. Make sure the backend is running first.

---

## API Endpoint Summary

| Method | Endpoint                     | Purpose                            |
|--------|------------------------------|------------------------------------|
| POST   | `/api/games`                 | Create a new game session          |
| GET    | `/api/games/{id}`            | Get current game state             |
| POST   | `/api/games/{id}/moves`      | Submit a player move               |
| POST   | `/api/games/{id}/undo`       | Undo last move                     |
| POST   | `/api/games/{id}/reset`      | Reset the board (keep scoreboard)  |
| GET    | `/api/scoreboard`            | Get scoreboard                     |
| POST   | `/api/scoreboard/reset`      | Reset scoreboard to zero           |

### Create Game — Request Body
```json
{ "mode": "TwoPlayer" }   // or "VsComputer"
```

### Make Move — Request Body
```json
{ "player": "X", "row": 0, "column": 0 }
```

### Game State Response
```json
{
  "id": "...",
  "mode": "TwoPlayer",
  "board": [["X","",""],["","O",""],["","",""]],
  "currentPlayer": "O",
  "status": "InProgress",
  "winner": null,
  "winningCells": null,
  "moveHistory": [
    { "moveNumber": 1, "player": "X", "row": 0, "column": 0, "position": "Row 1, Column 1" }
  ],
  "scoreboard": { "xWins": 0, "oWins": 0, "draws": 0 }
}
```

### Error Response
```json
{ "error": "Cell (1,1) is already occupied." }
```

---

## How to Run Tests

### Backend Tests
```bash
cd backend
dotnet test
```

Covers: valid move, invalid move, occupied cell, wrong player, turn switching, row win, column win, diagonal win (both), draw, move after completion, reset game, undo (2P), undo (computer mode), scoreboard update, scoreboard reversal on undo, computer AI win move, computer AI block move, computer AI center preference.

### Frontend Tests
```bash
cd frontend
npm test
```

Covers: GameService HTTP integration tests for all API endpoints.

---

## Design Decisions

### Backend is Source of Truth (Clarification 1)
All game state — board, current player, win/draw status, move history, scoreboard — lives in the backend. The Angular app is purely a rendering layer that reads from the latest API response after every action.

### Undo After Completion — Option B selected (Clarification 2)
Undo is **allowed after game completion**. If a won/drawn game is undone, the scoreboard is **reversed** by decrementing the appropriate counter. This is tracked with a `ScoreboardUpdated` flag per game session to prevent double-counting and supports clean reversal.

### Computer Move Happens Server-Side
When in VsComputer mode, the controller automatically calculates and applies the computer's move after the human move, within the same HTTP request. The client receives the final state after both moves, which avoids any client-side AI logic and keeps the backend authoritative.

### In-Memory Storage with ConcurrentDictionary
Games and the scoreboard are stored in-memory using `ConcurrentDictionary` and `Interlocked` operations for thread safety. This is appropriate for a local assessment. To persist beyond a single server session, swap `IGameService` / `IScoreboardService` implementations to use SQLite/EF Core — the interfaces make this a clean swap.

### Per-Game Locking
Each game has its own `lock` object to prevent race conditions on concurrent requests for the same game (e.g., two clients clicking simultaneously), while not blocking requests for different games.

### Global Exception Middleware
All exceptions are caught centrally and mapped to appropriate HTTP status codes:
- `GameNotFoundException` → 404
- `InvalidMoveException` → 400
- `GameAlreadyCompletedException` → 400
- Unexpected errors → 500

---

## AI Tools & Prompt Summary

**Tool used:** Claude (Anthropic)

**Workflow:**
1. Uploaded the problem statement and asked Claude to analyse it as a senior engineer
2. Requested full implementation: .NET backend + Angular frontend + tests + README
3. Reviewed all generated code carefully for correctness, especially:
   - Win detection logic and all 8 winning lines
   - Undo behavior differences between TwoPlayer and VsComputer modes
   - Scoreboard reversal logic on undo-after-completion
   - Thread safety (ConcurrentDictionary, Interlocked, per-game locks)
   - Computer AI priority order
4. Verified DTO mapping (2D array → string[][], flat index → row/col conversions)
5. Validated test coverage against every required scenario in the spec

**What was changed manually:** None — but the code was reviewed line-by-line for logic correctness before submission.

**Trade-offs made:**
- Chose Option B (undo after completion) for better UX
- In-memory storage for simplicity; architecture supports a clean swap to SQLite
- Computer AI uses heuristic priority (not minimax) — sufficient per spec, easily upgradeable

---

## Assumptions

1. A "session" is the lifetime of the backend process. Restarting the API clears all games and scores.
2. The frontend always creates a new game on load; game ID is stored in component state only.
3. In VsComputer mode, the human is always X and the computer is always O.
4. Row and Column indices are 0-based in the API; the UI displays them as 1-based ("Row 1, Column 1").
5. No authentication is required (in-memory local game, single-user context).

---

## Known Limitations

- Game state does not survive a server restart (in-memory only)
- No WebSocket support — all state is pulled synchronously after each action
- No AI difficulty levels (only one heuristic strategy)
- No mobile-optimised touch handling beyond responsive CSS

---

## Future Improvements

- Persist games to SQLite with Entity Framework Core
- Add minimax algorithm for unbeatable computer AI
- WebSocket / SignalR for real-time multiplayer
- JWT authentication for named players
- Game replay feature using move history
- Difficulty selector (easy / hard) for computer mode
