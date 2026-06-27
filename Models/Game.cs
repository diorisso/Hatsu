namespace Hatsu.Models;

public class Game : Entity<long>
{
    public string Name { get; set; } = string.Empty;
    public string? CoverUrl { get; set; }
    public string? Summary { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public DateTime CachedAt { get; set; } = DateTime.UtcNow;

    public int? DeveloperId { get; set; }
    public Company? Developer { get; set; }

    public int? PublisherId { get; set; }
    public Company? Publisher { get; set; }

    public List<Platform> Platforms { get; set; } = new();

    public List<Entry> Entries { get; set; } = new();
}
