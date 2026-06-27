using Hatsu.Dtos;
using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IIgdbService
{
    Task<IReadOnlyList<GameResponse>> SearchGamesAsync(string pSearch, int pLimit = 10);
    Task<Game?> GetGameByIdAsync(long pId);
}
