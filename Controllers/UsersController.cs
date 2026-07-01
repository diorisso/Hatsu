using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Hatsu.Dtos;
using Hatsu.Interfaces;
using Hatsu.Models;
using Hatsu.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace Hatsu.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private const long MaxUploadBytes = 5 * 1024 * 1024;
    private const int AvatarSize = 256;

    private readonly IUserService _userService;
    private readonly IAuthService _authService;
    private readonly IStorageService _storageService;
    private readonly StorageSettings _storageSettings;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserService pUserService,
        IAuthService pAuthService,
        IStorageService pStorageService,
        IOptions<StorageSettings> pStorageSettings,
        ILogger<UsersController> pLogger)
    {
        _userService = pUserService;
        _authService = pAuthService;
        _storageService = pStorageService;
        _storageSettings = pStorageSettings.Value;
        _logger = pLogger;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var xUser = await _userService.GetByIdAsync(GetUserId());
        if (xUser == null)
            return NotFound();

        return Ok(ToResponse(xUser));
    }

    [HttpPatch("me")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest pRequest)
    {
        var xUser = await _userService.GetByIdAsync(GetUserId());
        if (xUser == null)
            return NotFound();

        var xExisting = await _userService.GetByUsernameAsync(pRequest.Username);
        if (xExisting != null && xExisting.Id != xUser.Id)
            return Conflict(new { message = "Username is already taken." });

        xUser.Username = pRequest.Username;
        await _userService.UpdateAsync(xUser);

        return Ok(ToResponse(xUser));
    }

    [HttpPost("me/password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest pRequest)
    {
        try
        {
            await _authService.ChangePasswordAsync(GetUserId(), pRequest);
            return NoContent();
        }
        catch (InvalidOperationException xEx)
        {
            _logger.LogWarning(xEx, "Failed to change password for user {UserId}", GetUserId());
            return BadRequest(new { message = xEx.Message });
        }
    }

    [HttpPost("me/avatar")]
    [RequestSizeLimit(MaxUploadBytes)]
    public async Task<IActionResult> UploadAvatar([FromForm(Name = "file")] IFormFile pFile)
    {
        if (pFile == null || pFile.Length == 0)
            return BadRequest(new { message = "No file was uploaded." });

        if (pFile.Length > MaxUploadBytes)
            return BadRequest(new { message = "Image must be 5 MB or smaller." });

        if (!pFile.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only image files are allowed." });

        var xUser = await _userService.GetByIdAsync(GetUserId());
        if (xUser == null)
            return NotFound();

        try
        {
            using var xInput = pFile.OpenReadStream();
            using var xImage = await Image.LoadAsync(xInput);

            xImage.Mutate(p => p.Resize(new ResizeOptions
            {
                Size = new Size(AvatarSize, AvatarSize),
                Mode = ResizeMode.Crop
            }));

            using var xOutput = new MemoryStream();
            await xImage.SaveAsWebpAsync(xOutput);
            xOutput.Position = 0;

            var xKey = $"avatars/{xUser.Id}/{Guid.NewGuid():N}.webp";
            await _storageService.UploadAsync(xOutput, xKey, "image/webp");

            var xPreviousKey = xUser.AvatarKey;
            xUser.AvatarKey = xKey;
            await _userService.UpdateAsync(xUser);

            if (!string.IsNullOrEmpty(xPreviousKey))
                await RemoveQuietlyAsync(xPreviousKey);

            return Ok(ToResponse(xUser));
        }
        catch (UnknownImageFormatException xEx)
        {
            _logger.LogWarning(xEx, "Rejected unsupported avatar upload for user {UserId}", xUser.Id);
            return BadRequest(new { message = "That file isn't a supported image." });
        }
        catch (InvalidImageContentException xEx)
        {
            _logger.LogWarning(xEx, "Rejected corrupt avatar upload for user {UserId}", xUser.Id);
            return BadRequest(new { message = "That image appears to be corrupt." });
        }
        catch (Exception xEx)
        {
            _logger.LogError(xEx, "Failed to upload avatar for user {UserId}", xUser.Id);
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "Could not store the image right now." });
        }
    }

    [HttpDelete("me/avatar")]
    public async Task<IActionResult> RemoveAvatar()
    {
        var xUser = await _userService.GetByIdAsync(GetUserId());
        if (xUser == null)
            return NotFound();

        var xKey = xUser.AvatarKey;
        if (!string.IsNullOrEmpty(xKey))
        {
            xUser.AvatarKey = null;
            await _userService.UpdateAsync(xUser);
            await RemoveQuietlyAsync(xKey);
        }

        return Ok(ToResponse(xUser));
    }

    private async Task RemoveQuietlyAsync(string pKey)
    {
        try
        {
            await _storageService.DeleteAsync(pKey);
        }
        catch (Exception xEx)
        {
            _logger.LogWarning(xEx, "Failed to delete avatar object {Key}", pKey);
        }
    }

    private UserResponse ToResponse(User pUser)
    {
        var xReturn = new UserResponse
        {
            Id = pUser.Id,
            Username = pUser.Username,
            Email = pUser.Email,
            AvatarUrl = string.IsNullOrEmpty(pUser.AvatarKey)
                ? null
                : $"{_storageSettings.PublicBaseUrl.TrimEnd('/')}/{pUser.AvatarKey}"
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
