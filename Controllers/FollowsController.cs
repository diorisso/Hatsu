using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Hatsu.Dtos;
using Hatsu.Interfaces;
using Hatsu.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Hatsu.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class FollowsController : ControllerBase
{
    private readonly IFollowService _followService;
    private readonly IUserService _userService;
    private readonly StorageSettings _storageSettings;
    private readonly ILogger<FollowsController> _logger;

    public FollowsController(
        IFollowService pFollowService,
        IUserService pUserService,
        IOptions<StorageSettings> pStorageSettings,
        ILogger<FollowsController> pLogger)
    {
        _followService = pFollowService;
        _userService = pUserService;
        _storageSettings = pStorageSettings.Value;
        _logger = pLogger;
    }

    [HttpGet("{username}/followers")]
    public async Task<IActionResult> Followers(string username)
    {
        var xTarget = await _userService.GetByUsernameAsync(username);
        if (xTarget == null)
            return NotFound(new { message = "User not found." });

        var xUsers = await _followService.ListFollowersAsync(xTarget.Id);
        var xReturn = xUsers
            .Select(p => UserSummary.From(p, _storageSettings.PublicBaseUrl))
            .ToList();
        return Ok(xReturn);
    }

    [HttpGet("{username}/following")]
    public async Task<IActionResult> Following(string username)
    {
        var xTarget = await _userService.GetByUsernameAsync(username);
        if (xTarget == null)
            return NotFound(new { message = "User not found." });

        var xUsers = await _followService.ListFollowingAsync(xTarget.Id);
        var xReturn = xUsers
            .Select(p => UserSummary.From(p, _storageSettings.PublicBaseUrl))
            .ToList();
        return Ok(xReturn);
    }

    [HttpPost("{username}")]
    public async Task<IActionResult> Follow(string username)
    {
        var xTarget = await _userService.GetByUsernameAsync(username);
        if (xTarget == null)
            return NotFound(new { message = "User not found." });

        try
        {
            await _followService.FollowAsync(GetUserId(), xTarget.Id);
            return NoContent();
        }
        catch (InvalidOperationException xEx)
        {
            _logger.LogWarning(xEx, "Failed to follow user {Username}", username);
            return BadRequest(new { message = xEx.Message });
        }
    }

    [HttpDelete("{username}")]
    public async Task<IActionResult> Unfollow(string username)
    {
        var xTarget = await _userService.GetByUsernameAsync(username);
        if (xTarget == null)
            return NotFound(new { message = "User not found." });

        await _followService.UnfollowAsync(GetUserId(), xTarget.Id);
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
