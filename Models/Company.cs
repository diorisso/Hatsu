namespace Hatsu.Models;

public class Company : Entity<int>
{
    public int IgdbId { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<Game> GamesDeveloped { get; set; } = new();
    public List<Game> GamesPublished { get; set; } = new();
}
