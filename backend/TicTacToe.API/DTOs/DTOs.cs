using TicTacToe.API.Models;

namespace TicTacToe.API.DTOs;

// ─── Requests ───────────────────────────────────────────────────────────────

public record CreateGameRequest(GameMode Mode);

public record MakeMoveRequest(Player Player, int Row, int Column);

// ─── Responses ──────────────────────────────────────────────────────────────

public record MoveRecordDto(int MoveNumber, string Player, int Row, int Column, string Position);

public record ScoreboardDto(int XWins, int OWins, int Draws);

public record GameStateDto(
    string Id,
    string Mode,
    string[][] Board,            // "X" | "O" | "" per cell
    string CurrentPlayer,
    string Status,
    string? Winner,
    List<int>? WinningCells,
    List<MoveRecordDto> MoveHistory,
    ScoreboardDto Scoreboard
);

public record ErrorResponse(string Error, string? Detail = null);
