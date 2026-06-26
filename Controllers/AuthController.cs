using Hatsu.Dtos;
using Hatsu.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Hatsu.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService pAuthService, ILogger<AuthController> pLogger)
    {
        _authService = pAuthService;
        _logger = pLogger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest pRequest)
    {
        try
        {
            var xReturn = await _authService.RegisterAsync(pRequest);
            return Ok(xReturn);
        }
        catch (InvalidOperationException xEx)
        {
            _logger.LogWarning(xEx, "Failed to register user with email {Email}", pRequest.Email);
            return BadRequest(new { message = xEx.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest pRequest)
    {
        try
        {
            var xReturn = await _authService.LoginAsync(pRequest);
            return Ok(xReturn);
        }
        catch (InvalidOperationException xEx)
        {
            _logger.LogWarning(xEx, "Failed to authenticate user with email {Email}", pRequest.Email);
            return Unauthorized(new { message = xEx.Message });
        }
    }
}
