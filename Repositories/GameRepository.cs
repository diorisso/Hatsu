using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.EntityFrameworkCore;

namespace Hatsu.Repositories;

public class GameRepository : Repository<Game, int>, IGameRepository
{
    public GameRepository(HatsuDbContext pContext) : base(pContext.Games, pContext) { }

    public async Task<Game?> GetByIgdbIdAsync(int pIgdbId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .Include(p => p.Developer)
            .Include(p => p.Publisher)
            .Include(p => p.Platforms)
            .FirstOrDefaultAsync(p => p.IgdbId == pIgdbId);
        return xReturn;
    }
}
