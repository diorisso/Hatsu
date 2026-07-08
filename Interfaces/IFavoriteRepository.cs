using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IFavoriteRepository : IRepository<Favorite, int>
{
    Task<Favorite?> GetByUserAndGameAsync(int pUserId, long pGameId);
    Task<IReadOnlyList<Favorite>> ListByUserAsync(int pUserId);
    Task<IReadOnlyList<long>> ListGameIdsByUserAsync(int pUserId);
    Task HardDeleteAsync(Favorite pFavorite);
}
