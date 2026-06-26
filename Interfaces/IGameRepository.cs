using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IGameRepository : IRepository<Game, int>
{
    Task<Game?> GetByIgdbIdAsync(int pIgdbId);
}
