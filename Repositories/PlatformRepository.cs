using Hatsu.Database;
using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Repositories;

public class PlatformRepository : Repository<Platform, int>, IPlatformRepository
{
    public PlatformRepository(HatsuDbContext pContext) : base(pContext.Platforms, pContext) { }
}
