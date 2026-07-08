using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Hatsu.Dtos;
using Hatsu.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Refit;

namespace Hatsu.Controllers;

[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IIgdbService _igdbService;
    private readonly IGameService _gameService;
    private readonly IEntryService _entryService;
    private readonly IFavoriteService _favoriteService;
    private readonly ILogger<GamesController> _logger;

    public GamesController(
        IIgdbService pIgdbService,
        IGameService pGameService,
        IEntryService pEntryService,
        IFavoriteService pFavoriteService,
        ILogger<GamesController> pLogger)
    {
        _igdbService = pIgdbService;
        _gameService = pGameService;
        _entryService = pEntryService;
        _favoriteService = pFavoriteService;
        _logger = pLogger;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query, [FromQuery] int limit = 10)
    {
        try
        {
            var xGames = await _igdbService.SearchGamesAsync(query, limit);
            var xEntries = await _entryService.ListByUserAsync(GetUserId());
            var xStatusByGame = xEntries
                .GroupBy(p => p.GameId)
                .ToDictionary(p => p.Key, p => p.First().Status);

            var xReturn = xGames
                .Select(p => new SearchResultViewModel
                {
                    Game = p,
                    Status = xStatusByGame.TryGetValue(p.Id, out var xStatus) ? xStatus : null
                })
                .ToList();
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
        try
        {
            var xGame = await _gameService.GetByIdAsync(id);
            if (xGame == null)
                return NotFound();

            var xUserId = GetUserId();
            var xEntry = await _entryService.GetByUserAndGameAsync(xUserId, id);
            var xIsFavorite = await _favoriteService.IsFavoriteAsync(xUserId, id);

            var xReturn = new GameDetailViewModel
            {
                Game = xGame,
                Entry = xEntry == null ? null : EntryState.From(xEntry),
                IsFavorite = xIsFavorite
            };
            return Ok(xReturn);
        }
        catch (ApiException xEx)
        {
            _logger.LogError(xEx, "Failed to fetch game {GameId} from IGDB", id);
            return StatusCode((int)xEx.StatusCode, new { message = "Error querying IGDB." });
        }
    }

    private int GetUserId()
    {
        var xValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var xReturn = int.Parse(xValue!);
        return xReturn;
    }
}
