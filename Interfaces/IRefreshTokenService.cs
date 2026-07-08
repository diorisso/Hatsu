using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IRefreshTokenService : IService<RefreshToken, int>
{
    Task<RefreshToken> IssueAsync(int pUserId);
    Task<RefreshToken?> GetActiveAsync(string pToken);
    Task RevokeAsync(RefreshToken pToken);
}
