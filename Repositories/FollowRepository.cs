using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.EntityFrameworkCore;

namespace Hatsu.Repositories;

public class FollowRepository : Repository<Follow, int>, IFollowRepository
{
    public FollowRepository(HatsuDbContext pContext) : base(pContext.Follows, pContext) { }

    public async Task<Follow?> GetAsync(int pFollowerId, int pFolloweeId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .FirstOrDefaultAsync(p => p.FollowerId == pFollowerId && p.FolloweeId == pFolloweeId);
        return xReturn;
    }

    public async Task<int> CountFollowersAsync(int pUserId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded && p.FolloweeId == pUserId)
            .CountAsync();
        return xReturn;
    }

    public async Task<int> CountFollowingAsync(int pUserId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded && p.FollowerId == pUserId)
            .CountAsync();
        return xReturn;
    }

    public async Task<IReadOnlyList<User>> ListFollowersAsync(int pUserId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded && p.FolloweeId == pUserId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => p.Follower)
            .ToListAsync();
        return xReturn;
    }

    public async Task<IReadOnlyList<User>> ListFollowingAsync(int pUserId)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded && p.FollowerId == pUserId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => p.Followee)
            .ToListAsync();
        return xReturn;
    }

    public async Task HardDeleteAsync(Follow pFollow)
    {
        _dbSet.Remove(pFollow);
        await SaveAsync();
    }
}
