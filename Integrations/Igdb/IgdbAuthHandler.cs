using System.Net.Http.Headers;
using Hatsu.Settings;
using Microsoft.Extensions.Options;

namespace Hatsu.Integrations.Igdb;

public class IgdbAuthHandler : DelegatingHandler
{
    private readonly IgdbTokenProvider _tokenProvider;
    private readonly IgdbSettings _settings;

    public IgdbAuthHandler(IgdbTokenProvider pTokenProvider, IOptions<IgdbSettings> pSettings)
    {
        _tokenProvider = pTokenProvider;
        _settings = pSettings.Value;
    }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage pRequest, CancellationToken pCancellationToken)
    {
        var xToken = await _tokenProvider.GetAccessTokenAsync();

        pRequest.Headers.Remove("Client-ID");
        pRequest.Headers.Add("Client-ID", _settings.ClientId);
        pRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", xToken);

        var xReturn = await base.SendAsync(pRequest, pCancellationToken);
        return xReturn;
    }
}
