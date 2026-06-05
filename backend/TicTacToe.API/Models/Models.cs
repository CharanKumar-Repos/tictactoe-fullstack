namespace TicTacToe.API.Models;

public enum Player { X, O }

public enum GameStatus { InProgress, Won, Draw }

public enum GameMode { TwoPlayer, VsComputer }

public class MoveRecord
{
    public int MoveNumber { get; set; }
    public Player Player { get; set; }
    public int Row { get; set; }
    public int Column { get; set; }
}

public class GameSession
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public GameMode Mode { get; set; }

    /// <summary>
    /// 3x3 board: null = empty, Player.X or Player.O
    /// </summary>
    public Player?[,] Board { get; set; } = new Player?[3, 3];

    public Player CurrentPlayer { get; set; } = Player.X;
    public GameStatus Status { get; set; } = GameStatus.InProgress;
    public Player? Winner { get; set; }

    /// <summary>
    /// Indices of the three winning cells: [row*3+col, ...]
    /// </summary>
    public List<int>? WinningCells { get; set; }

    public List<MoveRecord> MoveHistory { get; set; } = new();

    /// <summary>
    /// Tracks whether the scoreboard has already been updated for this game's result.
    /// Prevents double-counting when the game ends.
    /// </summary>
    public bool ScoreboardUpdated { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class Scoreboard
{
    public int XWins { get; set; }
    public int OWins { get; set; }
    public int Draws { get; set; }
}
