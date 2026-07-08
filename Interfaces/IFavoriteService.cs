using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IFavoriteService : IService<Favorite, int>
{
    Task<IReadOnlyList<Favorite>> ListByUserAsync(int pUserId);
    Task<IReadOnlyList<long>> ListGameIdsByUserAsync(int pUserId);
    Task<bool> IsFavoriteAsync(int pUserId, long pGameId);
    Task AddAsync(int pUserId, long pGameId);
    Task RemoveAsync(int pUserId, long pGameId);
}
