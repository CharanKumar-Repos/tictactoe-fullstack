import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach, test, expect } from 'vitest';
import App from './App';
import * as gameService from './services/gameService';

// ─── Mock the service ─────────────────────────────────────────────────────────

const mockState = {
  id: 'test-123',
  mode: 'TwoPlayer',
  board: [['', '', ''], ['', '', ''], ['', '', '']],
  currentPlayer: 'X',
  status: 'InProgress' as const,
  winner: null,
  winningCells: null,
  moveHistory: [],
  scoreboard: { xWins: 0, oWins: 0, draws: 0 },
};

vi.mock('./services/gameService');
const mockedService = gameService as typeof gameService & {
  createGame: ReturnType<typeof vi.fn>;
  makeMove: ReturnType<typeof vi.fn>;
  undoMove: ReturnType<typeof vi.fn>;
  resetGame: ReturnType<typeof vi.fn>;
  resetScoreboard: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.mocked(gameService.createGame).mockResolvedValue(mockState);
  vi.mocked(gameService.makeMove).mockResolvedValue(mockState);
  vi.mocked(gameService.undoMove).mockResolvedValue(mockState);
  vi.mocked(gameService.resetGame).mockResolvedValue(mockState);
  vi.mocked(gameService.resetScoreboard).mockResolvedValue({ xWins: 0, oWins: 0, draws: 0 });
});

afterEach(() => vi.clearAllMocks());

// ─── Tests ────────────────────────────────────────────────────────────────────

test('renders the app title', async () => {
  render(<App />);
  expect(await screen.findByText('Tic Tac Toe')).toBeInTheDocument();
});

test('renders mode selector buttons', async () => {
  render(<App />);
  expect(await screen.findByText(/Two Player/i)).toBeInTheDocument();
  expect(screen.getByText(/vs Computer/i)).toBeInTheDocument();
});

test('renders 9 board cells after load', async () => {
  render(<App />);
  await waitFor(() => {
    const cells = screen.getAllByRole('button', { name: /Cell/i });
    expect(cells).toHaveLength(9);
  });
});

test('shows player turn status', async () => {
  render(<App />);
  expect(await screen.findByText(/Player X's turn/i)).toBeInTheDocument();
});

test('renders scoreboard section', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('Scoreboard')).toBeInTheDocument();
  });
});

test('renders move history section', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('Move History')).toBeInTheDocument();
    expect(screen.getByText(/No moves yet/i)).toBeInTheDocument();
  });
});

test('calls createGame with TwoPlayer on mount', async () => {
  render(<App />);
  await waitFor(() => {
    expect(vi.mocked(gameService.createGame)).toHaveBeenCalledWith('TwoPlayer');
  });
});

test('calls createGame with VsComputer when mode switched', async () => {
  render(<App />);
  await screen.findByText(/Two Player/i);
  fireEvent.click(screen.getByText(/vs Computer/i));
  await waitFor(() => {
    expect(vi.mocked(gameService.createGame)).toHaveBeenCalledWith('VsComputer');
  });
});

test('undo button is disabled when no moves', async () => {
  render(<App />);
  await waitFor(() => {
    const undoBtn = screen.getByRole('button', { name: /undo/i });
    expect(undoBtn).toBeDisabled();
  });
});

test('shows error banner and dismisses it', async () => {
  vi.mocked(gameService.createGame).mockRejectedValueOnce(new Error('Network error'));
  render(<App />);
  expect(await screen.findByText(/Network error/i)).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText(/dismiss error/i));
  await waitFor(() => {
    expect(screen.queryByText(/Network error/i)).not.toBeInTheDocument();
  });
});
