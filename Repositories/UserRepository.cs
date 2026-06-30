using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;
using Microsoft.EntityFrameworkCore;

namespace Hatsu.Repositories;

public class UserRepository : Repository<User, int>, IUserRepository
{
    public UserRepository(HatsuDbContext pContext) : base(pContext.Users, pContext) { }

    public async Task<User?> GetByUsernameAsync(string pUsername)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .FirstOrDefaultAsync(p => p.Username == pUsername);
        return xReturn;
    }

    public async Task<User?> GetByEmailAsync(string pEmail)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .FirstOrDefaultAsync(p => p.Email == pEmail);
        return xReturn;
    }

    public async Task<User?> GetByEmailVerificationTokenAsync(string pToken)
    {
        var xReturn = await _dbSet
            .Where(p => !p.IsExcluded)
            .FirstOrDefaultAsync(p => p.EmailVerificationToken == pToken);
        return xReturn;
    }
}
