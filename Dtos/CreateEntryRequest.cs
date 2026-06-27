using System.ComponentModel.DataAnnotations;
using Hatsu.Models;

namespace Hatsu.Dtos;

public class CreateEntryRequest
{
    [Range(1, long.MaxValue)]
    public long GameId { get; set; }

    public EntryStatus Status { get; set; } = EntryStatus.Backlog;

    public float? Rating { get; set; }

    public string? Notes { get; set; }
}
