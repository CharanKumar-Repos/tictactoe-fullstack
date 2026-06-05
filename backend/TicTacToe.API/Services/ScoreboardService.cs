using TicTacToe.API.DTOs;
using TicTacToe.API.Models;

namespace TicTacToe.API.Services;

public interface IScoreboardService
{
    ScoreboardDto Get();
    void Record(GameStatus status, Player? winner);
    void Reverse(GameStatus status, Player? winner);
    void Reset();
}

/// <summary>
/// Thread-safe in-memory scoreboard using Interlocked operations.
/// </summary>
public class ScoreboardService(ILogger<ScoreboardService> logger) : IScoreboardService
{
    private int _xWins;
    private int _oWins;
    private int _draws;

    public ScoreboardDto Get() =>
        new(_xWins, _oWins, _draws);

    public void Record(GameStatus status, Player? winner)
    {
        if (status == GameStatus.Won)
        {
            if (winner == Player.X) Interlocked.Increment(ref _xWins);
            else Interlocked.Increment(ref _oWins);
        }
        else if (status == GameStatus.Draw)
        {
            Interlocked.Increment(ref _draws);
        }

        logger.LogInformation("Scoreboard updated — X:{X} O:{O} D:{D}", _xWins, _oWins, _draws);
    }

    public void Reverse(GameStatus status, Player? winner)
    {
        if (status == GameStatus.Won)
        {
            if (winner == Player.X) Interlocked.Decrement(ref _xWins);
            else Interlocked.Decrement(ref _oWins);
        }
        else if (status == GameStatus.Draw)
        {
            Interlocked.Decrement(ref _draws);
        }

        logger.LogInformation("Scoreboard reversed — X:{X} O:{O} D:{D}", _xWins, _oWins, _draws);
    }

    public void Reset()
    {
        Interlocked.Exchange(ref _xWins, 0);
        Interlocked.Exchange(ref _oWins, 0);
        Interlocked.Exchange(ref _draws, 0);
        logger.LogInformation("Scoreboard reset.");
    }
}
