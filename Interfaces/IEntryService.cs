using Hatsu.Dtos;
using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IEntryService : IService<Entry, int>
{
    Task<Entry> CreateAsync(int pUserId, CreateEntryRequest pRequest);
    Task<IReadOnlyList<Entry>> ListByUserAsync(int pUserId);
    Task<Entry?> GetByUserAndGameAsync(int pUserId, long pGameId);
    Task<Entry> UpdateAsync(int pUserId, int pId, UpdateEntryRequest pRequest);
    Task DeleteAsync(int pUserId, int pId);
}
