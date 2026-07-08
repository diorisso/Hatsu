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
public class LibraryController : ControllerBase
{
    private readonly IEntryService _entryService;
    private readonly IFavoriteService _favoriteService;

    public LibraryController(IEntryService pEntryService, IFavoriteService pFavoriteService)
    {
        _entryService = pEntryService;
        _favoriteService = pFavoriteService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMine()
    {
        var xUserId = GetUserId();
        var xEntries = await _entryService.ListByUserAsync(xUserId);
        var xFavoriteIds = await _favoriteService.ListGameIdsByUserAsync(xUserId);

        var xReturn = new LibraryViewModel
        {
            Entries = xEntries.Select(EntryViewModel.From).ToList(),
            FavoriteGameIds = xFavoriteIds.ToList()
        };
        return Ok(xReturn);
    }

    private int GetUserId()
    {
        var xValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var xReturn = int.Parse(xValue!);
        return xReturn;
    }
}
