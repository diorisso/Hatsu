using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.EntityFrameworkCore;

namespace Hatsu.Repositories;

public class EntryRepository : Repository<Entry, int>, IEntryRepository
{
    public EntryRepository(HatsuDbContext pContext) : base(pContext.Entries, pContext) { }

    public async Task<Entry?> GetByUserAndGameAsync(int pUserId, long pGameId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .FirstOrDefaultAsync(p => p.UserId == pUserId && p.GameId == pGameId);
        return xReturn;
    }

    public async Task<IReadOnlyList<Entry>> ListByUserAsync(int pUserId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded && p.UserId == pUserId)
            .ToListAsync();
        return xReturn;
    }
}
