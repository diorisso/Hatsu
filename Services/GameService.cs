using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class GameService : Service<Game, long>, IGameService
{
    private readonly IIgdbService _igdbService;

    public GameService(IGameRepository pRepository, IIgdbService pIgdbService) : base(pRepository)
    {
        _igdbService = pIgdbService;
    }

    public override async Task<Game?> GetByIdAsync(long pId)
    {
        var xReturn = await base.GetByIdAsync(pId);
        if (xReturn == null)
            xReturn = await _igdbService.GetGameByIdAsync(pId);

        return xReturn;
    }
}
