using Microsoft.AspNetCore.Mvc;
using TicTacToe.API.DTOs;
using TicTacToe.API.Services;

namespace TicTacToe.API.Controllers;

[ApiController]
[Route("api/scoreboard")]
[Produces("application/json")]
public class ScoreboardController(IScoreboardService scoreboardService, ILogger<ScoreboardController> logger) : ControllerBase
{
    /// <summary>Returns the current scoreboard.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ScoreboardDto), StatusCodes.Status200OK)]
    public IActionResult GetScoreboard()
    {
        return Ok(scoreboardService.Get());
    }

    /// <summary>Resets the scoreboard to zero.</summary>
    [HttpPost("reset")]
    [ProducesResponseType(typeof(ScoreboardDto), StatusCodes.Status200OK)]
    public IActionResult ResetScoreboard()
    {
        logger.LogInformation("Scoreboard reset requested.");
        scoreboardService.Reset();
        return Ok(scoreboardService.Get());
    }
}
