using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Hatsu.Dtos;
using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hatsu.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class EntriesController : ControllerBase
{
    private readonly IEntryService _entryService;
    private readonly ILogger<EntriesController> _logger;

    public EntriesController(IEntryService pEntryService, ILogger<EntriesController> pLogger)
    {
        _entryService = pEntryService;
        _logger = pLogger;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateEntryRequest pRequest)
    {
        try
        {
            var xUserId = GetUserId();
            var xEntry = await _entryService.CreateAsync(xUserId, pRequest);
            return Ok(ToResponse(xEntry));
        }
        catch (InvalidOperationException xEx)
        {
            _logger.LogWarning(xEx, "Failed to create entry for game {GameId}", pRequest.GameId);
            return Conflict(new { message = xEx.Message });
        }
        catch (KeyNotFoundException xEx)
        {
            _logger.LogWarning(xEx, "Failed to create entry for unknown game {GameId}", pRequest.GameId);
            return NotFound(new { message = xEx.Message });
        }
        catch (Refit.ApiException xEx)
        {
            _logger.LogError(xEx, "Failed to resolve game {GameId} from IGDB", pRequest.GameId);
            return StatusCode((int)xEx.StatusCode, new { message = "Error querying IGDB." });
        }
    }

    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateEntryRequest pRequest)
    {
        try
        {
            var xUserId = GetUserId();
            var xEntry = await _entryService.UpdateAsync(xUserId, id, pRequest);
            return Ok(ToResponse(xEntry));
        }
        catch (KeyNotFoundException xEx)
        {
            _logger.LogWarning(xEx, "Failed to update entry {EntryId}", id);
            return NotFound(new { message = xEx.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var xUserId = GetUserId();
            await _entryService.DeleteAsync(xUserId, id);
            return NoContent();
        }
        catch (KeyNotFoundException xEx)
        {
            _logger.LogWarning(xEx, "Failed to delete entry {EntryId}", id);
            return NotFound(new { message = xEx.Message });
        }
    }

    private int GetUserId()
    {
        var xValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var xReturn = int.Parse(xValue!);
        return xReturn;
    }

    private static EntryResponse ToResponse(Entry pEntry)
    {
        var xReturn = new EntryResponse
        {
            Id = pEntry.Id,
            GameId = pEntry.GameId,
            Status = pEntry.Status,
            Rating = pEntry.Rating,
            Notes = pEntry.Notes,
            CreatedAt = pEntry.CreatedAt,
            UpdatedAt = pEntry.UpdatedAt
        };
        return xReturn;
    }
}
