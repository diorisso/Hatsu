using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.EntityFrameworkCore;

namespace Hatsu.Repositories;

public class GameRepository : Repository<Game, long>, IGameRepository
{
    public GameRepository(HatsuDbContext pContext) : base(pContext.Games, pContext) { }

    public override async Task<Game?> GetByIdAsync(long pId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .Include(p => p.Developer)
            .Include(p => p.Publisher)
            .Include(p => p.Platforms)
            .Include(p => p.Genres)
            .FirstOrDefaultAsync(p => p.Id == pId);
        return xReturn;
    }
}
