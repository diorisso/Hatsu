using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.EntityFrameworkCore;

namespace Hatsu.Repositories;

public class FavoriteRepository : Repository<Favorite, int>, IFavoriteRepository
{
    public FavoriteRepository(HatsuDbContext pContext) : base(pContext.Favorites, pContext) { }

    public async Task<Favorite?> GetByUserAndGameAsync(int pUserId, long pGameId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .FirstOrDefaultAsync(p => p.UserId == pUserId && p.GameId == pGameId);
        return xReturn;
    }

    public async Task<IReadOnlyList<Favorite>> ListByUserAsync(int pUserId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded && p.UserId == pUserId)
            .Include(p => p.Game)
                .ThenInclude(g => g.Developer)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
        return xReturn;
    }

    public async Task<IReadOnlyList<long>> ListGameIdsByUserAsync(int pUserId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded && p.UserId == pUserId)
            .Select(p => p.GameId)
            .ToListAsync();
        return xReturn;
    }

    public async Task HardDeleteAsync(Favorite pFavorite)
    {
        _dbSet.Remove(pFavorite);
        await SaveAsync();
    }
}
