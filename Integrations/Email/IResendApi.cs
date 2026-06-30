using Hatsu.Integrations.Email.Dtos;
using Refit;

namespace Hatsu.Integrations.Email;

public interface IResendApi
{
    [Post("/emails")]
    Task<ResendEmailResponse> SendEmailAsync([Body] ResendEmailRequest pRequest);
}
