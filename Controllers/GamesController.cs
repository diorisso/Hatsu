using Hatsu.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Refit;

namespace Hatsu.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IIgdbService _igdbService;
    private readonly IGameService _gameService;
    private readonly ILogger<GamesController> _logger;

    public GamesController(IIgdbService pIgdbService, IGameService pGameService, ILogger<GamesController> pLogger)
    {
        _igdbService = pIgdbService;
        _gameService = pGameService;
        _logger = pLogger;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] int limit = 10)
    {
        try
        {
            var xReturn = await _igdbService.SearchGamesAsync(query, limit);
            return Ok(xReturn);
        }
        catch (ApiException xEx)
        {
            _logger.LogError(xEx, "Failed to search games on IGDB with term {Query}", query);
            return StatusCode((int)xEx.StatusCode, new { message = "Error querying IGDB." });
        }
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var xGame = await _gameService.GetByIdAsync(id);
        if (xGame == null)
            return NotFound();

        return Ok(xGame);
    }
}
