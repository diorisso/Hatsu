using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Hatsu.Dtos;
using Hatsu.Interfaces;
using Hatsu.Models;
using Hatsu.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Hatsu.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IEntryService _entryService;
    private readonly IFavoriteService _favoriteService;
    private readonly IFollowService _followService;
    private readonly StorageSettings _storageSettings;

    public ProfileController(
        IUserService pUserService,
        IEntryService pEntryService,
        IFavoriteService pFavoriteService,
        IFollowService pFollowService,
        IOptions<StorageSettings> pStorageSettings)
    {
        _userService = pUserService;
        _entryService = pEntryService;
        _favoriteService = pFavoriteService;
        _followService = pFollowService;
        _storageSettings = pStorageSettings.Value;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMine()
    {
        var xUser = await _userService.GetByIdAsync(GetUserId());
        if (xUser == null)
            return NotFound();

        var xReturn = await BuildProfileAsync(xUser);
        return Ok(xReturn);
    }

    [HttpGet("{username}")]
    public async Task<IActionResult> GetByUsername(string username)
    {
        var xUser = await _userService.GetByUsernameAsync(username);
        if (xUser == null)
            return NotFound(new { message = "User not found." });

        var xReturn = await BuildProfileAsync(xUser);
        return Ok(xReturn);
    }

    private async Task<ProfileViewModel> BuildProfileAsync(User pUser)
    {
        var xViewerId = GetUserId();
        var xIsSelf = pUser.Id == xViewerId;

        var xEntries = await _entryService.ListByUserAsync(pUser.Id);
        var xFavorites = await _favoriteService.ListByUserAsync(pUser.Id);
        var xFollowerCount = await _followService.CountFollowersAsync(pUser.Id);
        var xFollowingCount = await _followService.CountFollowingAsync(pUser.Id);
        var xIsFollowing = !xIsSelf && await _followService.IsFollowingAsync(xViewerId, pUser.Id);

        var xReturn = new ProfileViewModel
        {
            User = ProfileUserViewModel.From(pUser, _storageSettings.PublicBaseUrl),
            IsSelf = xIsSelf,
            IsFollowing = xIsFollowing,
            FollowerCount = xFollowerCount,
            FollowingCount = xFollowingCount,
            Entries = xEntries.Select(EntryViewModel.From).ToList(),
            Favorites = xFavorites
                .Select(p => GameSummary.From(p.Game))
                .Where(p => p != null)
                .Select(p => p!)
                .ToList()
        };
        return xReturn;
    }

    private int GetUserId()
    {
        var xValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var xReturn = int.Parse(xValue!);
        return xReturn;
    }
}
