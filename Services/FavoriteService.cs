using Hatsu.Interfaces;
using Hatsu.Models;

namespace Hatsu.Services;

public class FavoriteService : Service<Favorite, int>, IFavoriteService
{
    private readonly IFavoriteRepository _repository;
    private readonly IGameService _gameService;

    public FavoriteService(IFavoriteRepository pRepository, IGameService pGameService) : base(pRepository)
    {
        _repository = pRepository;
        _gameService = pGameService;
    }

    public async Task<IReadOnlyList<Favorite>> ListByUserAsync(int pUserId)
    {
        var xReturn = await _repository.ListByUserAsync(pUserId);
        return xReturn;
    }

    public async Task<IReadOnlyList<long>> ListGameIdsByUserAsync(int pUserId)
    {
        var xReturn = await _repository.ListGameIdsByUserAsync(pUserId);
        return xReturn;
    }

    public async Task<bool> IsFavoriteAsync(int pUserId, long pGameId)
    {
        var xFavorite = await _repository.GetByUserAndGameAsync(pUserId, pGameId);
        var xReturn = xFavorite != null;
        return xReturn;
    }

    public async Task AddAsync(int pUserId, long pGameId)
    {
        var xExisting = await _repository.GetByUserAndGameAsync(pUserId, pGameId);
        if (xExisting != null)
            return;

        var xGame = await _gameService.GetByIdAsync(pGameId);
        if (xGame == null)
            throw new KeyNotFoundException("Game not found.");

        var xFavorite = new Favorite
        {
            UserId = pUserId,
            GameId = pGameId
        };

        await base.CreateAsync(xFavorite);
    }

    public async Task RemoveAsync(int pUserId, long pGameId)
    {
        var xFavorite = await _repository.GetByUserAndGameAsync(pUserId, pGameId);
        if (xFavorite == null)
            return;

        await _repository.HardDeleteAsync(xFavorite);
    }
}
