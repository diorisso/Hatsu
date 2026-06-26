namespace Hatsu.Models;

public class User : Entity<int>
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    public List<Entry> Entries { get; set; } = new();
}
