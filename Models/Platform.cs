namespace Hatsu.Models;

public class Platform : Entity<int>
{
    public int IgdbId { get; set; }
    public string Name { get; set; } = string.Empty;
}
