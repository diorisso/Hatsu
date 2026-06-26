using Hatsu.Settings;
using Microsoft.Extensions.Options;

namespace Hatsu.Integrations.Igdb;

public class IgdbTokenProvider
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IgdbSettings _settings;
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    private string? _accessToken;
    private DateTime _expiresAt;

    public IgdbTokenProvider(IServiceScopeFactory pScopeFactory, IOptions<IgdbSettings> pSettings)
    {
        _scopeFactory = pScopeFactory;
        _settings = pSettings.Value;
    }

    public async Task<string> GetAccessTokenAsync()
    {
        if (IsTokenValid())
        {
            var xCached = _accessToken!;
            return xCached;
        }

        await _semaphore.WaitAsync();
        try
        {
            if (IsTokenValid())
            {
                var xCached = _accessToken!;
                return xCached;
            }

            using var xScope = _scopeFactory.CreateScope();
            var xAuthApi = xScope.ServiceProvider.GetRequiredService<ITwitchAuthApi>();
            var xResponse = await xAuthApi.GetTokenAsync(_settings.ClientId, _settings.ClientSecret, "client_credentials");

            _accessToken = xResponse.AccessToken;
            _expiresAt = DateTime.UtcNow.AddSeconds(xResponse.ExpiresIn - 60);

            var xReturn = _accessToken;
            return xReturn;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private bool IsTokenValid()
    {
        var xReturn = _accessToken != null && DateTime.UtcNow < _expiresAt;
        return xReturn;
    }
}
