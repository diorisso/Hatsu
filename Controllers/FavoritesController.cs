using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Hatsu.Dtos;
using Hatsu.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hatsu.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;
    private readonly ILogger<FavoritesController> _logger;

    public FavoritesController(IFavoriteService pFavoriteService, ILogger<FavoritesController> pLogger)
    {
        _favoriteService = pFavoriteService;
        _logger = pLogger;
    }

    [HttpPost]
    public async Task<IActionResult> Add(FavoriteRequest pRequest)
    {
        try
        {
            await _favoriteService.AddAsync(GetUserId(), pRequest.GameId);
            return NoContent();
        }
        catch (KeyNotFoundException xEx)
        {
            _logger.LogWarning(xEx, "Failed to favorite unknown game {GameId}", pRequest.GameId);
            return NotFound(new { message = xEx.Message });
        }
    }

    [HttpDelete("{gameId:long}")]
    public async Task<IActionResult> Remove(long gameId)
    {
        await _favoriteService.RemoveAsync(GetUserId(), gameId);
        return NoContent();
    }

    private int GetUserId()
    {
        var xValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var xReturn = int.Parse(xValue!);
        return xReturn;
    }
}
