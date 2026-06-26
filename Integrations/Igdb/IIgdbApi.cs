using Hatsu.Integrations.Igdb.Dtos;
using Refit;

namespace Hatsu.Integrations.Igdb;

public interface IIgdbApi
{
    [Post("/v4/games")]
    Task<IReadOnlyList<IgdbGame>> QueryGamesAsync([Body] string pQuery);
}
