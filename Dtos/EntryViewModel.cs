using Hatsu.Models;

namespace Hatsu.Dtos;

public class EntryViewModel
{
    public int Id { get; set; }
    public EntryStatus Status { get; set; }
    public byte? Rating { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public GameSummary? Game { get; set; }

    public static EntryViewModel From(Entry pEntry)
    {
        var xReturn = new EntryViewModel
        {
            Id = pEntry.Id,
            Status = pEntry.Status,
            Rating = pEntry.Rating,
            Notes = pEntry.Notes,
            CreatedAt = pEntry.CreatedAt,
            UpdatedAt = pEntry.UpdatedAt,
            Game = GameSummary.From(pEntry.Game)
        };
        return xReturn;
    }
}
