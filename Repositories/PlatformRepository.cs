using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.EntityFrameworkCore;

namespace Hatsu.Repositories;

public class PlatformRepository : Repository<Platform, int>, IPlatformRepository
{
    public PlatformRepository(HatsuDbContext pContext) : base(pContext.Platforms, pContext) { }

    public async Task<Platform?> GetByIgdbIdAsync(int pIgdbId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .FirstOrDefaultAsync(p => p.IgdbId == pIgdbId);
        return xReturn;
    }
}
