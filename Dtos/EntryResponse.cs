using Hatsu.Models;

namespace Hatsu.Dtos;

public class EntryResponse
{
    public int Id { get; set; }
    public long GameId { get; set; }
    public EntryStatus Status { get; set; }
    public byte? Rating { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
