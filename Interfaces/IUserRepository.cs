using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IUserRepository : IRepository<User, int>
{
    Task<User?> GetByUsernameAsync(string pUsername);
    Task<User?> GetByEmailAsync(string pEmail);
}
