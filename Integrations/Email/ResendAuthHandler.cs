using System.Net.Http.Headers;
using Hatsu.Settings;
using Microsoft.Extensions.Options;

namespace Hatsu.Integrations.Email;

public class ResendAuthHandler : DelegatingHandler
{
    private readonly EmailSettings _settings;

    public ResendAuthHandler(IOptions<EmailSettings> pSettings)
    {
        _settings = pSettings.Value;
    }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage pRequest, CancellationToken pCancellationToken)
    {
        pRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);

        var xReturn = await base.SendAsync(pRequest, pCancellationToken);
        return xReturn;
    }
}
