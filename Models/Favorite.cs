namespace Hatsu.Models;

public class Favorite : Entity<int>
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public long GameId { get; set; }
    public Game Game { get; set; } = null!;
}
