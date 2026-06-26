namespace Hatsu.Dtos;

public class GameResponse
{
    public int Id { get; set; }
    public int IgdbId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? CoverUrl { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public CompanySummary? Developer { get; set; }
    public CompanySummary? Publisher { get; set; }
    public List<PlatformSummary> Platforms { get; set; } = new();
}

public class CompanySummary
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class PlatformSummary
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
