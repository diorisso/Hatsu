using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class FollowService : Service<Follow, int>, IFollowService
{
    private readonly IFollowRepository _repository;
    private readonly IUserService _userService;

    public FollowService(IFollowRepository pRepository, IUserService pUserService) : base(pRepository)
    {
        _repository = pRepository;
        _userService = pUserService;
    }

    public async Task<bool> IsFollowingAsync(int pFollowerId, int pFolloweeId)
    {
        var xFollow = await _repository.GetAsync(pFollowerId, pFolloweeId);
        var xReturn = xFollow != null;
        return xReturn;
    }

    public async Task<int> CountFollowersAsync(int pUserId)
    {
        var xReturn = await _repository.CountFollowersAsync(pUserId);
        return xReturn;
    }

    public async Task<int> CountFollowingAsync(int pUserId)
    {
        var xReturn = await _repository.CountFollowingAsync(pUserId);
        return xReturn;
    }

    public async Task<IReadOnlyList<User>> ListFollowersAsync(int pUserId)
    {
        var xReturn = await _repository.ListFollowersAsync(pUserId);
        return xReturn;
    }

    public async Task<IReadOnlyList<User>> ListFollowingAsync(int pUserId)
    {
        var xReturn = await _repository.ListFollowingAsync(pUserId);
        return xReturn;
    }

    public async Task FollowAsync(int pFollowerId, int pFolloweeId)
    {
        if (pFollowerId == pFolloweeId)
            throw new InvalidOperationException("You cannot follow yourself.");

        var xFollowee = await _userService.GetByIdAsync(pFolloweeId);
        if (xFollowee == null)
            throw new KeyNotFoundException("User not found.");

        var xExisting = await _repository.GetAsync(pFollowerId, pFolloweeId);
        if (xExisting != null)
            return;

        var xFollow = new Follow
        {
            FollowerId = pFollowerId,
            FolloweeId = pFolloweeId
        };

        await base.CreateAsync(xFollow);
    }

    public async Task UnfollowAsync(int pFollowerId, int pFolloweeId)
    {
        var xFollow = await _repository.GetAsync(pFollowerId, pFolloweeId);
        if (xFollow == null)
            return;

        await _repository.HardDeleteAsync(xFollow);
    }
}
