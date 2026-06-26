using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IPlatformRepository : IRepository<Platform, int>
{
    Task<Platform?> GetByIgdbIdAsync(int pIgdbId);
}
