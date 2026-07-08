using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IFollowRepository : IRepository<Follow, int>
{
    Task<Follow?> GetAsync(int pFollowerId, int pFolloweeId);
    Task<int> CountFollowersAsync(int pUserId);
    Task<int> CountFollowingAsync(int pUserId);
    Task<IReadOnlyList<User>> ListFollowersAsync(int pUserId);
    Task<IReadOnlyList<User>> ListFollowingAsync(int pUserId);
    Task HardDeleteAsync(Follow pFollow);
}
