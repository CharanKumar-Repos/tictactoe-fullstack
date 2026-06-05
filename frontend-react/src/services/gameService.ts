import axios, { AxiosError } from 'axios';
import {
  GameState,
  GameMode,
  Player,
  Scoreboard,
  CreateGameRequest,
  MakeMoveRequest,
  ApiError,
} from '../types/game.types';
import { config } from '../utils/config';

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: config.apiBase,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ─── Error normaliser ─────────────────────────────────────────────────────────

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as AxiosError<ApiError>;
  if (axiosErr.response?.data?.error) {
    return axiosErr.response.data.error;
  }
  if (axiosErr.message) return axiosErr.message;
  return 'An unexpected error occurred.';
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function createGame(mode: GameMode): Promise<GameState> {
  try {
    const body: CreateGameRequest = { mode };
    const { data } = await api.post<GameState>('/games', body);
    console.log('[GameService] Game created:', data.id);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getGame(id: string): Promise<GameState> {
  try {
    const { data } = await api.get<GameState>(`/games/${id}`);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function makeMove(
  id: string,
  player: Player,
  row: number,
  column: number
): Promise<GameState> {
  try {
    const body: MakeMoveRequest = { player, row, column };
    const { data } = await api.post<GameState>(`/games/${id}/moves`, body);
    console.log(`[GameService] Move by ${player} → (${row},${column}). Status: ${data.status}`);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function undoMove(id: string): Promise<GameState> {
  try {
    const { data } = await api.post<GameState>(`/games/${id}/undo`, {});
    console.log('[GameService] Undo move');
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function resetGame(id: string): Promise<GameState> {
  try {
    const { data } = await api.post<GameState>(`/games/${id}/reset`, {});
    console.log('[GameService] Game reset');
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function getScoreboard(): Promise<Scoreboard> {
  try {
    const { data } = await api.get<Scoreboard>('/scoreboard');
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function resetScoreboard(): Promise<Scoreboard> {
  try {
    const { data } = await api.post<Scoreboard>('/scoreboard/reset', {});
    console.log('[GameService] Scoreboard reset');
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}
