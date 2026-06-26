using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class UserService : Service<User, int>, IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository pRepository) : base(pRepository)
    {
        _userRepository = pRepository;
    }

    public async Task<User?> GetByUsernameAsync(string pUsername)
    {
        var xReturn = await _userRepository.GetByUsernameAsync(pUsername);
        return xReturn;
    }

    public async Task<User?> GetByEmailAsync(string pEmail)
    {
        var xReturn = await _userRepository.GetByEmailAsync(pEmail);
        return xReturn;
    }
}
