using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IEntryRepository : IRepository<Entry, int>
{
    Task<Entry?> GetByUserAndGameAsync(int pUserId, long pGameId);
    Task<IReadOnlyList<Entry>> ListByUserAsync(int pUserId);
}
