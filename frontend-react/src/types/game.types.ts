// ─── Enums ───────────────────────────────────────────────────────────────────

export type Player = 'X' | 'O';
export type GameMode = 'TwoPlayer' | 'VsComputer';
export type GameStatus = 'InProgress' | 'Won' | 'Draw';

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface MoveRecord {
  moveNumber: number;
  player: string;
  row: number;
  column: number;
  position: string;
}

export interface Scoreboard {
  xWins: number;
  oWins: number;
  draws: number;
}

export interface GameState {
  id: string;
  mode: string;
  board: string[][];       // 3x3 — "" | "X" | "O"
  currentPlayer: string;
  status: GameStatus;
  winner: string | null;
  winningCells: number[] | null;
  moveHistory: MoveRecord[];
  scoreboard: Scoreboard;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  detail?: string;
}

export interface CreateGameRequest {
  mode: GameMode;
}

export interface MakeMoveRequest {
  player: Player;
  row: number;
  column: number;
}
