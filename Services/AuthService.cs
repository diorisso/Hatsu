using Hatsu.Dtos;
using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.AspNetCore.Identity;

namespace Hatsu.Services;

public class AuthService : IAuthService
{
    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthService(IUserService pUserService, ITokenService pTokenService)
    {
        _userService = pUserService;
        _tokenService = pTokenService;
        _passwordHasher = new PasswordHasher<User>();
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest pRequest)
    {
        var xExistingByUsername = await _userService.GetByUsernameAsync(pRequest.Username);
        if (xExistingByUsername != null)
            throw new InvalidOperationException("Username is already taken.");

        var xExistingByEmail = await _userService.GetByEmailAsync(pRequest.Email);
        if (xExistingByEmail != null)
            throw new InvalidOperationException("Email is already registered.");

        var xUser = new User
        {
            Username = pRequest.Username,
            Email = pRequest.Email
        };
        xUser.PasswordHash = _passwordHasher.HashPassword(xUser, pRequest.Password);

        var xCreated = await _userService.CreateAsync(xUser);

        var xReturn = _tokenService.GenerateToken(xCreated);
        return xReturn;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest pRequest)
    {
        var xUser = await _userService.GetByEmailAsync(pRequest.Email);
        if (xUser == null)
            throw new InvalidOperationException("Invalid email or password.");

        var xVerification = _passwordHasher.VerifyHashedPassword(xUser, xUser.PasswordHash, pRequest.Password);
        if (xVerification == PasswordVerificationResult.Failed)
            throw new InvalidOperationException("Invalid email or password.");

        var xReturn = _tokenService.GenerateToken(xUser);
        return xReturn;
    }
}
