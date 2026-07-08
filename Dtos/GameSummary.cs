using Hatsu.Models;

namespace Hatsu.Dtos;

public class GameSummary
{
    public long Id { get; set; }
    public GameType Type { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? CoverUrl { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public CompanySummary? Developer { get; set; }
    public List<GenreSummary> Genres { get; set; } = new();

    public static GameSummary? From(Game? pGame)
    {
        if (pGame == null)
            return null;

        var xReturn = new GameSummary
        {
            Id = pGame.Id,
            Type = pGame.Type,
            Name = pGame.Name,
            CoverUrl = pGame.CoverUrl,
            ReleaseDate = pGame.ReleaseDate,
            Developer = pGame.Developer == null
                ? null
                : new CompanySummary { Id = pGame.Developer.Id, Name = pGame.Developer.Name },
            Genres = pGame.Genres.Select(g => new GenreSummary { Id = g.Id, Name = g.Name }).ToList()
        };
        return xReturn;
    }
}
