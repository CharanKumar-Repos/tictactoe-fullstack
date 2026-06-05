using System.Collections.Concurrent;
using TicTacToe.API.DTOs;
using TicTacToe.API.Exceptions;
using TicTacToe.API.Models;

namespace TicTacToe.API.Services;

public interface IGameService
{
    GameStateDto CreateGame(GameMode mode);
    GameStateDto GetGame(string gameId);
    GameStateDto MakeMove(string gameId, Player player, int row, int col);
    GameStateDto UndoMove(string gameId);
    GameStateDto ResetGame(string gameId);
}

/// <summary>
/// In-memory game service. Thread-safe via ConcurrentDictionary + per-game locking.
/// </summary>
public class GameService(IScoreboardService scoreboardService, ILogger<GameService> logger) : IGameService
{
    private readonly ConcurrentDictionary<string, GameSession> _games = new();

    // Per-game locks to avoid race conditions on concurrent requests for the same game
    private readonly ConcurrentDictionary<string, object> _locks = new();

    // ─── Win combinations (flat index = row*3+col) ──────────────────────────
    private static readonly int[][] WinLines =
    [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]              // diagonals
    ];

    // ────────────────────────────────────────────────────────────────────────
    // Public API
    // ────────────────────────────────────────────────────────────────────────

    public GameStateDto CreateGame(GameMode mode)
    {
        var session = new GameSession { Mode = mode };
        _games[session.Id] = session;
        _locks[session.Id] = new object();
        logger.LogInformation("Game created: {GameId}, Mode: {Mode}", session.Id, mode);
        return ToDto(session);
    }

    public GameStateDto GetGame(string gameId)
    {
        var session = GetSessionOrThrow(gameId);
        return ToDto(session);
    }

    public GameStateDto MakeMove(string gameId, Player player, int row, int col)
    {
        var session = GetSessionOrThrow(gameId);

        lock (GetLock(gameId))
        {
            ValidateMove(session, player, row, col);

            // Apply move
            session.Board[row, col] = player;
            var moveNumber = session.MoveHistory.Count + 1;
            session.MoveHistory.Add(new MoveRecord
            {
                MoveNumber = moveNumber,
                Player = player,
                Row = row,
                Column = col
            });

            logger.LogInformation("Game {GameId}: Move #{MoveNumber} — {Player} → ({Row},{Col})",
                gameId, moveNumber, player, row, col);

            // Evaluate game state
            EvaluateBoard(session);

            // Update scoreboard if game just ended
            if (session.Status != GameStatus.InProgress && !session.ScoreboardUpdated)
            {
                scoreboardService.Record(session.Status, session.Winner);
                session.ScoreboardUpdated = true;
            }

            session.UpdatedAt = DateTime.UtcNow;
        }

        return ToDto(session);
    }

    public GameStateDto UndoMove(string gameId)
    {
        var session = GetSessionOrThrow(gameId);

        lock (GetLock(gameId))
        {
            if (session.MoveHistory.Count == 0)
                throw new InvalidMoveException("No moves to undo.");

            // Decide how many moves to pop based on mode
            int movesToRemove = session.Mode == GameMode.VsComputer ? 2 : 1;

            // If fewer moves exist than requested, just remove what's there
            movesToRemove = Math.Min(movesToRemove, session.MoveHistory.Count);

            // If the game was completed and the scoreboard was updated, reverse it
            if (session.Status != GameStatus.InProgress && session.ScoreboardUpdated)
            {
                scoreboardService.Reverse(session.Status, session.Winner);
                session.ScoreboardUpdated = false;
                logger.LogInformation("Game {GameId}: Reversed scoreboard due to undo after completion.", gameId);
            }

            for (int i = 0; i < movesToRemove; i++)
            {
                var last = session.MoveHistory[^1];
                session.Board[last.Row, last.Column] = null;
                session.MoveHistory.RemoveAt(session.MoveHistory.Count - 1);
                logger.LogInformation("Game {GameId}: Undid move by {Player} at ({Row},{Col})",
                    gameId, last.Player, last.Row, last.Column);
            }

            // Recalculate state from scratch
            session.Status = GameStatus.InProgress;
            session.Winner = null;
            session.WinningCells = null;
            EvaluateBoard(session);

            // Restore current player
            session.CurrentPlayer = session.MoveHistory.Count == 0
                ? Player.X
                : Opponent(session.MoveHistory[^1].Player);

            session.UpdatedAt = DateTime.UtcNow;
        }

        return ToDto(session);
    }

    public GameStateDto ResetGame(string gameId)
    {
        var session = GetSessionOrThrow(gameId);

        lock (GetLock(gameId))
        {
            session.Board = new Player?[3, 3];
            session.MoveHistory.Clear();
            session.Status = GameStatus.InProgress;
            session.Winner = null;
            session.WinningCells = null;
            session.CurrentPlayer = Player.X;
            session.ScoreboardUpdated = false;
            session.UpdatedAt = DateTime.UtcNow;
            logger.LogInformation("Game {GameId}: Reset.", gameId);
        }

        return ToDto(session);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Computer move (called by controller after human move in VsComputer mode)
    // ────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Determines the best move for the computer (O) using priority rules.
    /// Priority: win > block > center > corner > any
    /// </summary>
    public (int row, int col) ComputerMove(string gameId)
    {
        var session = GetSessionOrThrow(gameId);

        // 1. Can O win immediately?
        var win = FindWinningMove(session.Board, Player.O);
        if (win.HasValue) return win.Value;

        // 2. Block X from winning
        var block = FindWinningMove(session.Board, Player.X);
        if (block.HasValue) return block.Value;

        // 3. Take center
        if (session.Board[1, 1] == null) return (1, 1);

        // 4. Take a corner
        int[][] corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
        foreach (var c in corners)
            if (session.Board[c[0], c[1]] == null) return (c[0], c[1]);

        // 5. Any available cell
        for (int r = 0; r < 3; r++)
            for (int c = 0; c < 3; c++)
                if (session.Board[r, c] == null) return (r, c);

        throw new InvalidOperationException("No available moves for computer.");
    }

    // ────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ────────────────────────────────────────────────────────────────────────

    private void ValidateMove(GameSession session, Player player, int row, int col)
    {
        if (session.Status != GameStatus.InProgress)
            throw new GameAlreadyCompletedException();

        if (row < 0 || row > 2 || col < 0 || col > 2)
            throw new InvalidMoveException($"Cell ({row},{col}) is outside the board.");

        if (session.Board[row, col] != null)
            throw new InvalidMoveException($"Cell ({row},{col}) is already occupied.");

        if (session.CurrentPlayer != player)
            throw new InvalidMoveException($"It is {session.CurrentPlayer}'s turn, not {player}'s.");
    }

    private static void EvaluateBoard(GameSession session)
    {
        // Check wins
        foreach (var line in WinLines)
        {
            var a = IndexToCell(line[0]);
            var b = IndexToCell(line[1]);
            var c = IndexToCell(line[2]);

            var pa = session.Board[a.r, a.c];
            if (pa != null && pa == session.Board[b.r, b.c] && pa == session.Board[c.r, c.c])
            {
                session.Status = GameStatus.Won;
                session.Winner = pa;
                session.WinningCells = [line[0], line[1], line[2]];
                return;
            }
        }

        // Check draw
        bool hasEmpty = false;
        for (int r = 0; r < 3; r++)
            for (int c = 0; c < 3; c++)
                if (session.Board[r, c] == null) { hasEmpty = true; break; }

        if (!hasEmpty)
        {
            session.Status = GameStatus.Draw;
            return;
        }

        // Still in progress — advance turn
        if (session.MoveHistory.Count > 0)
            session.CurrentPlayer = Opponent(session.MoveHistory[^1].Player);
    }

    private static (int row, int col)? FindWinningMove(Player?[,] board, Player player)
    {
        foreach (var line in WinLines)
        {
            var cells = line.Select(IndexToCell).ToList();
            var owned = cells.Count(c => board[c.r, c.c] == player);
            var empty = cells.Where(c => board[c.r, c.c] == null).ToList();

            if (owned == 2 && empty.Count == 1)
                return (empty[0].r, empty[0].c);
        }
        return null;
    }

    private static (int r, int c) IndexToCell(int idx) => (idx / 3, idx % 3);

    private static Player Opponent(Player p) => p == Player.X ? Player.O : Player.X;

    private GameSession GetSessionOrThrow(string gameId)
    {
        if (!_games.TryGetValue(gameId, out var session))
            throw new GameNotFoundException(gameId);
        return session;
    }

    private object GetLock(string gameId) => _locks.GetOrAdd(gameId, _ => new object());

    // ────────────────────────────────────────────────────────────────────────
    // DTO mapping
    // ────────────────────────────────────────────────────────────────────────

    private GameStateDto ToDto(GameSession s)
    {
        // Convert 2D array to string[][]
        var board = Enumerable.Range(0, 3)
            .Select(r => Enumerable.Range(0, 3)
                .Select(c => s.Board[r, c]?.ToString() ?? "")
                .ToArray())
            .ToArray();

        var history = s.MoveHistory.Select(m => new MoveRecordDto(
            m.MoveNumber,
            m.Player.ToString(),
            m.Row,
            m.Column,
            $"Row {m.Row + 1}, Column {m.Column + 1}"
        )).ToList();

        return new GameStateDto(
            Id: s.Id,
            Mode: s.Mode.ToString(),
            Board: board,
            CurrentPlayer: s.CurrentPlayer.ToString(),
            Status: s.Status.ToString(),
            Winner: s.Winner?.ToString(),
            WinningCells: s.WinningCells,
            MoveHistory: history,
            Scoreboard: scoreboardService.Get()
        );
    }
}
