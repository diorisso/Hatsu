using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class GameService : Service<Game, int>, IGameService
{
    public GameService(IGameRepository pRepository) : base(pRepository) { }
}
