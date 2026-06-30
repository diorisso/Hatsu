using System.Security.Cryptography;
using Hatsu.Dtos;
using Hatsu.Exceptions;
using Hatsu.Interfaces;
using Hatsu.Models;
using Hatsu.Settings;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Hatsu.Services;

public class AuthService : IAuthService
{
    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;
    private readonly IEmailSender _emailSender;
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<AuthService> _logger;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthService(
        IUserService pUserService,
        ITokenService pTokenService,
        IEmailSender pEmailSender,
        IOptions<EmailSettings> pEmailSettings,
        ILogger<AuthService> pLogger)
    {
        _userService = pUserService;
        _tokenService = pTokenService;
        _emailSender = pEmailSender;
        _emailSettings = pEmailSettings.Value;
        _logger = pLogger;
        _passwordHasher = new PasswordHasher<User>();
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest pRequest)
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
            Email = pRequest.Email,
            EmailConfirmed = false,
            EmailVerificationToken = GenerateToken(),
            EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(_emailSettings.VerificationTokenLifetimeHours)
        };
        xUser.PasswordHash = _passwordHasher.HashPassword(xUser, pRequest.Password);

        var xCreated = await _userService.CreateAsync(xUser);

        await SendVerificationAsync(xCreated);

        var xReturn = new RegisterResponse
        {
            Email = xCreated.Email,
            Message = "We've sent a verification link to your email. Confirm it to sign in."
        };
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

        if (!xUser.EmailConfirmed)
            throw new EmailNotVerifiedException("Please verify your email before signing in.");

        var xReturn = _tokenService.GenerateToken(xUser);
        return xReturn;
    }

    public async Task<AuthResponse> VerifyEmailAsync(string pToken)
    {
        var xUser = string.IsNullOrWhiteSpace(pToken)
            ? null
            : await _userService.GetByEmailVerificationTokenAsync(pToken);

        if (xUser == null || xUser.EmailVerificationTokenExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("This verification link is invalid or has expired.");

        xUser.EmailConfirmed = true;
        xUser.EmailVerificationToken = null;
        xUser.EmailVerificationTokenExpiresAt = null;
        await _userService.UpdateAsync(xUser);

        var xReturn = _tokenService.GenerateToken(xUser);
        return xReturn;
    }

    public async Task ResendVerificationAsync(ResendVerificationRequest pRequest)
    {
        var xUser = await _userService.GetByEmailAsync(pRequest.Email);
        if (xUser == null || xUser.EmailConfirmed)
            return;

        xUser.EmailVerificationToken = GenerateToken();
        xUser.EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(_emailSettings.VerificationTokenLifetimeHours);
        await _userService.UpdateAsync(xUser);

        await SendVerificationAsync(xUser);
    }

    private async Task SendVerificationAsync(User pUser)
    {
        try
        {
            await _emailSender.SendVerificationEmailAsync(pUser);
        }
        catch (Exception xEx)
        {
            _logger.LogError(xEx, "Falha ao enviar e-mail de verificação para {Email}", pUser.Email);
        }
    }

    private static string GenerateToken()
    {
        var xBytes = RandomNumberGenerator.GetBytes(32);
        var xReturn = Convert.ToBase64String(xBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
        return xReturn;
    }
}
