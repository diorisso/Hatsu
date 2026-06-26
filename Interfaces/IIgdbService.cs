using Hatsu.Dtos;

namespace Hatsu.Interfaces;

public interface IIgdbService
{
    Task<IReadOnlyList<GameResponse>> SearchGamesAsync(string pSearch, int pLimit = 10);
}
