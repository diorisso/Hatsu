using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IFollowService : IService<Follow, int>
{
    Task<bool> IsFollowingAsync(int pFollowerId, int pFolloweeId);
    Task<int> CountFollowersAsync(int pUserId);
    Task<int> CountFollowingAsync(int pUserId);
    Task<IReadOnlyList<User>> ListFollowersAsync(int pUserId);
    Task<IReadOnlyList<User>> ListFollowingAsync(int pUserId);
    Task FollowAsync(int pFollowerId, int pFolloweeId);
    Task UnfollowAsync(int pFollowerId, int pFolloweeId);
}
