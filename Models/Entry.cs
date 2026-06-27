namespace Hatsu.Models;

public enum EntryStatus { Playing, Completed, Backlog, Dropped }

public class Entry : Entity<int>
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public long GameId { get; set; }
    public Game Game { get; set; } = null!;

    public EntryStatus Status { get; set; } = EntryStatus.Backlog;
    public byte? Rating { get; set; }
    public string? Notes { get; set; }
}
