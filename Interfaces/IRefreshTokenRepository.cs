using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IRefreshTokenRepository : IRepository<RefreshToken, int>
{
    Task<RefreshToken?> GetByTokenAsync(string pToken);
}
