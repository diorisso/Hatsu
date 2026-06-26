using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Hatsu.Dtos;
using Hatsu.Interfaces;
using Hatsu.Models;
using Hatsu.Settings;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Hatsu.Services;

public class TokenService : ITokenService
{
    private readonly JwtSettings _settings;

    public TokenService(IOptions<JwtSettings> pSettings)
    {
        _settings = pSettings.Value;
    }

    public AuthResponse GenerateToken(User pUser)
    {
        var xClaims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, pUser.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, pUser.Username),
            new Claim(JwtRegisteredClaimNames.Email, pUser.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var xKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var xCredentials = new SigningCredentials(xKey, SecurityAlgorithms.HmacSha256);
        var xExpiresAt = DateTime.UtcNow.AddMinutes(_settings.ExpiryMinutes);

        var xToken = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: xClaims,
            expires: xExpiresAt,
            signingCredentials: xCredentials);

        var xReturn = new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(xToken),
            ExpiresAt = xExpiresAt
        };
        return xReturn;
    }
}
