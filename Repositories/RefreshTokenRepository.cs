using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.EntityFrameworkCore;

namespace Hatsu.Repositories;

public class RefreshTokenRepository : Repository<RefreshToken, int>, IRefreshTokenRepository
{
    public RefreshTokenRepository(HatsuDbContext pContext) : base(pContext.RefreshTokens, pContext) { }

    public async Task<RefreshToken?> GetByTokenAsync(string pToken)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .FirstOrDefaultAsync(p => p.Token == pToken);
        return xReturn;
    }
}
