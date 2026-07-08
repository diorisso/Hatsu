using System.Security.Cryptography;
using Hatsu.Interfaces;
using Hatsu.Models;
using Hatsu.Settings;
using Microsoft.Extensions.Options;

namespace Hatsu.Services;

public class RefreshTokenService : Service<RefreshToken, int>, IRefreshTokenService
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly JwtSettings _settings;

    public RefreshTokenService(IRefreshTokenRepository pRepository, IOptions<JwtSettings> pSettings) : base(pRepository)
    {
        _refreshTokenRepository = pRepository;
        _settings = pSettings.Value;
    }

    public async Task<RefreshToken> IssueAsync(int pUserId)
    {
        var xToken = new RefreshToken
        {
            Token = GenerateToken(),
            UserId = pUserId,
            ExpiresAt = DateTime.UtcNow.AddDays(_settings.RefreshTokenExpiryDays)
        };

        var xReturn = await CreateAsync(xToken);
        return xReturn;
    }

    public async Task<RefreshToken?> GetActiveAsync(string pToken)
    {
        var xToken = string.IsNullOrWhiteSpace(pToken)
            ? null
            : await _refreshTokenRepository.GetByTokenAsync(pToken);

        if (xToken == null || xToken.RevokedAt != null || xToken.ExpiresAt < DateTime.UtcNow)
            return null;

        var xReturn = xToken;
        return xReturn;
    }

    public async Task RevokeAsync(RefreshToken pToken)
    {
        pToken.RevokedAt = DateTime.UtcNow;
        await UpdateAsync(pToken);
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
