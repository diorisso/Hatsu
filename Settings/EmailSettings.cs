namespace Hatsu.Settings;

public class EmailSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string FromAddress { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
    public string VerificationUrl { get; set; } = string.Empty;
    public int VerificationTokenLifetimeHours { get; set; } = 24;
}
