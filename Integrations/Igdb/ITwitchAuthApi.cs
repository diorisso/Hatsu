using Hatsu.Integrations.Igdb.Dtos;
using Refit;

namespace Hatsu.Integrations.Igdb;

public interface ITwitchAuthApi
{
    [Post("/oauth2/token")]
    Task<TwitchTokenResponse> GetTokenAsync(
        [Query] string client_id,
        [Query] string client_secret,
        [Query] string grant_type);
}
