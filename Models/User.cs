namespace Hatsu.Models;

public class User : Entity<int>
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    public bool EmailConfirmed { get; set; }
    public string? EmailVerificationToken { get; set; }
    public DateTime? EmailVerificationTokenExpiresAt { get; set; }

    public List<Entry> Entries { get; set; } = new();
}
