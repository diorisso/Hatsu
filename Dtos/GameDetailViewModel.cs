using Hatsu.Models;

namespace Hatsu.Dtos;

public class GameDetailViewModel
{
    public Game Game { get; set; } = null!;
    public EntryState? Entry { get; set; }
    public bool IsFavorite { get; set; }
}

public class EntryState
{
    public int Id { get; set; }
    public EntryStatus Status { get; set; }
    public byte? Rating { get; set; }
    public string? Notes { get; set; }

    public static EntryState From(Entry pEntry)
    {
        var xReturn = new EntryState
        {
            Id = pEntry.Id,
            Status = pEntry.Status,
            Rating = pEntry.Rating,
            Notes = pEntry.Notes
        };
        return xReturn;
    }
}
