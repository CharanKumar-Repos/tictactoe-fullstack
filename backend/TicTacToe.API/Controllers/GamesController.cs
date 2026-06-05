using Microsoft.AspNetCore.Mvc;
using TicTacToe.API.DTOs;
using TicTacToe.API.Models;
using TicTacToe.API.Services;

namespace TicTacToe.API.Controllers;

[ApiController]
[Route("api/games")]
[Produces("application/json")]
public class GamesController(IGameService gameService, ILogger<GamesController> logger) : ControllerBase
{
    /// <summary>Creates a new game session.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(GameStateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public IActionResult CreateGame([FromBody] CreateGameRequest request)
    {
        logger.LogInformation("Creating game, Mode: {Mode}", request.Mode);
        var state = gameService.CreateGame(request.Mode);
        return CreatedAtAction(nameof(GetGame), new { id = state.Id }, state);
    }

    /// <summary>Returns the current state of a game.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(GameStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult GetGame(string id)
    {
        var state = gameService.GetGame(id);
        return Ok(state);
    }

    /// <summary>Submits a player move. If in VsComputer mode and the game is still in progress, the computer will also move.</summary>
    [HttpPost("{id}/moves")]
    [ProducesResponseType(typeof(GameStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult MakeMove(string id, [FromBody] MakeMoveRequest request)
    {
        logger.LogInformation("Game {GameId}: Move request from {Player} at ({Row},{Col})",
            id, request.Player, request.Row, request.Column);

        var state = gameService.MakeMove(id, request.Player, request.Row, request.Column);

        // In computer mode, auto-play O's move if game is still in progress
        if (state.Mode == GameMode.VsComputer.ToString() && state.Status == GameStatus.InProgress.ToString())
        {
            var (compRow, compCol) = ((GameService)gameService).ComputerMove(id);
            logger.LogInformation("Game {GameId}: Computer moves at ({Row},{Col})", id, compRow, compCol);
            state = gameService.MakeMove(id, Player.O, compRow, compCol);
        }

        return Ok(state);
    }

    /// <summary>Undoes the last move (or last pair in VsComputer mode).</summary>
    [HttpPost("{id}/undo")]
    [ProducesResponseType(typeof(GameStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult UndoMove(string id)
    {
        logger.LogInformation("Game {GameId}: Undo requested.", id);
        var state = gameService.UndoMove(id);
        return Ok(state);
    }

    /// <summary>Resets the board but keeps the scoreboard.</summary>
    [HttpPost("{id}/reset")]
    [ProducesResponseType(typeof(GameStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult ResetGame(string id)
    {
        logger.LogInformation("Game {GameId}: Reset requested.", id);
        var state = gameService.ResetGame(id);
        return Ok(state);
    }
}
