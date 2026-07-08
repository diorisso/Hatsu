using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IUserService : IService<User, int>
{
    Task<User?> GetByUsernameAsync(string pUsername);
    Task<User?> GetByEmailAsync(string pEmail);
    Task<User?> GetByEmailVerificationTokenAsync(string pToken);
    Task<List<User>> SearchByUsernameAsync(string pQuery, int pLimit);
}
