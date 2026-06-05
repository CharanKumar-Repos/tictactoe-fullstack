import { useState, useEffect, useCallback } from 'react';
import { GameState, GameMode, Player } from '../types/game.types';
import * as gameService from '../services/gameService';

interface UseGameReturn {
  state: GameState | null;
  loading: boolean;
  error: string | null;
  selectedMode: GameMode;
  clearError: () => void;
  handleModeChange: (mode: GameMode) => void;
  handleCellClick: (idx: number) => void;
  handleUndo: () => void;
  handleResetGame: () => void;
  handleResetScoreboard: () => void;
  canUndo: boolean;
  statusMessage: string;
  isBoardLocked: boolean;
}

export function useGame(): UseGameReturn {
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>('TwoPlayer');

  // ─── Derived state ──────────────────────────────────────────────────────────

  const isBoardLocked = !state || state.status !== 'InProgress' || loading;

  const canUndo = (() => {
    if (!state || loading || state.moveHistory.length === 0) return false;
    if (state.mode === 'TwoPlayer') {
      const lastMove = state.moveHistory[state.moveHistory.length - 1];
      return lastMove.player !== state.currentPlayer;
    }
    return state.moveHistory.length > 0;
  })();

  const statusMessage = (() => {
    if (!state) return '';
    if (state.status === 'Won') return `🎉 Player ${state.winner} wins!`;
    if (state.status === 'Draw') return "It's a draw! 🤝";
    const isComputer = state.mode === 'VsComputer' && state.currentPlayer === 'O';
    return isComputer ? '🤖 Computer is thinking…' : `Player ${state.currentPlayer}'s turn`;
  })();

  // ─── Actions ────────────────────────────────────────────────────────────────

  const createGame = useCallback(async (mode: GameMode) => {
    setError(null);
    setLoading(true);
    try {
      const newState = await gameService.createGame(mode);
      setState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleModeChange = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
    createGame(mode);
  }, [createGame]);

  const handleCellClick = useCallback(async (idx: number) => {
    if (!state || isBoardLocked) return;
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    if (state.board[row][col] !== '') return;

    setLoading(true);
    setError(null);
    try {
      const newState = await gameService.makeMove(
        state.id,
        state.currentPlayer as Player,
        row,
        col
      );
      setState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Move failed.');
    } finally {
      setLoading(false);
    }
  }, [state, isBoardLocked]);

  const handleUndo = useCallback(async () => {
    if (!state || !canUndo) return;
    setLoading(true);
    setError(null);
    try {
      const newState = await gameService.undoMove(state.id);
      setState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Undo failed.');
    } finally {
      setLoading(false);
    }
  }, [state, canUndo]);

  const handleResetGame = useCallback(async () => {
    if (!state) return;
    setLoading(true);
    setError(null);
    try {
      const newState = await gameService.resetGame(state.id);
      setState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed.');
    } finally {
      setLoading(false);
    }
  }, [state]);

  const handleResetScoreboard = useCallback(async () => {
    if (!state) return;
    setLoading(true);
    setError(null);
    try {
      const scoreboard = await gameService.resetScoreboard();
      setState(prev => prev ? { ...prev, scoreboard } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoreboard reset failed.');
    } finally {
      setLoading(false);
    }
  }, [state]);

  const clearError = useCallback(() => setError(null), []);

  // ─── Init ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    createGame('TwoPlayer');
  }, [createGame]);

  return {
    state,
    loading,
    error,
    selectedMode,
    clearError,
    handleModeChange,
    handleCellClick,
    handleUndo,
    handleResetGame,
    handleResetScoreboard,
    canUndo,
    statusMessage,
    isBoardLocked,
  };
}
