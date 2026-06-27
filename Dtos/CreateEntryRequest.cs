using System.ComponentModel.DataAnnotations;
using Hatsu.Models;

namespace Hatsu.Dtos;

public class CreateEntryRequest
{
    [Range(1, long.MaxValue)]
    public long GameId { get; set; }

    public EntryStatus Status { get; set; } = EntryStatus.Backlog;

    [Range(1, 10)]
    public byte? Rating { get; set; }

    public string? Notes { get; set; }
}
