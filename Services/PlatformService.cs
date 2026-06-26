using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class PlatformService : Service<Platform, int>, IPlatformService
{
    public PlatformService(IPlatformRepository pRepository) : base(pRepository) { }
}
