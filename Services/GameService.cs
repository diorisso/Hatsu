using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class GameService : Service<Game, long>, IGameService
{
    public GameService(IGameRepository pRepository) : base(pRepository) { }
}
