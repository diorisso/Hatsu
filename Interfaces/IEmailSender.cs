using Hatsu.Models;

namespace Hatsu.Interfaces;

public interface IEmailSender
{
    Task SendVerificationEmailAsync(User pUser);
}
