using Hatsu.Models;

namespace Hatsu.Dtos;

public class UpdateEntryRequest
{
    public EntryStatus? Status { get; set; }

    public float? Rating { get; set; }

    public string? Notes { get; set; }
}
