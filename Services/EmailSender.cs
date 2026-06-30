using Hatsu.Integrations.Email;
using Hatsu.Integrations.Email.Dtos;
using Hatsu.Interfaces;
using Hatsu.Models;
using Hatsu.Settings;
using Microsoft.Extensions.Options;

namespace Hatsu.Services;

public class EmailSender : IEmailSender
{
    private readonly IResendApi _resendApi;
    private readonly EmailSettings _settings;

    public EmailSender(IResendApi pResendApi, IOptions<EmailSettings> pSettings)
    {
        _resendApi = pResendApi;
        _settings = pSettings.Value;
    }

    public async Task SendVerificationEmailAsync(User pUser)
    {
        var xLink = $"{_settings.VerificationUrl}?token={Uri.EscapeDataString(pUser.EmailVerificationToken ?? string.Empty)}";

        var xRequest = new ResendEmailRequest
        {
            From = $"{_settings.FromName} <{_settings.FromAddress}>",
            To = new[] { pUser.Email },
            Subject = "Verify your Hatsu email",
            Html = BuildHtml(pUser.Username, xLink)
        };

        await _resendApi.SendEmailAsync(xRequest);
    }

    private static string BuildHtml(string pUsername, string pLink)
    {
        var xReturn = $"""
            <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #171a21;">
              <h1 style="font-size: 20px;">Welcome to Hatsu, {pUsername}</h1>
              <p style="font-size: 15px; line-height: 1.5;">Confirm your email address to start tracking your games.</p>
              <p style="margin: 28px 0;">
                <a href="{pLink}" style="background: #ee6c4d; color: #fff; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 600; font-size: 15px;">Verify email</a>
              </p>
              <p style="font-size: 13px; color: #565d6a;">Or paste this link into your browser:<br>{pLink}</p>
              <p style="font-size: 13px; color: #565d6a;">If you didn't create a Hatsu account, you can ignore this email.</p>
            </div>
            """;
        return xReturn;
    }
}
