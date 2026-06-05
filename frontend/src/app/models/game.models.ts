export type Player = 'X' | 'O';
export type GameMode = 'TwoPlayer' | 'VsComputer';
export type GameStatus = 'InProgress' | 'Won' | 'Draw';

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
  board: string[][];      // 3×3 matrix of "" | "X" | "O"
  currentPlayer: string;
  status: string;
  winner: string | null;
  winningCells: number[] | null;
  moveHistory: MoveRecord[];
  scoreboard: Scoreboard;
}
