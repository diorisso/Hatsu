using System.ComponentModel.DataAnnotations;
using Hatsu.Models;

namespace Hatsu.Dtos;

public class UpdateEntryRequest
{
    public EntryStatus? Status { get; set; }

    [Range(1, 10)]
    public byte? Rating { get; set; }

    public string? Notes { get; set; }
}
