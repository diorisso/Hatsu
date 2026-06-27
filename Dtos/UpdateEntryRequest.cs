using Hatsu.Models;

namespace Hatsu.Dtos;

public class UpdateEntryRequest
{
    public Optional<EntryStatus?> Status { get; set; }

    [OptionalRatingRange(1, 10)]
    public Optional<byte?> Rating { get; set; }

    public Optional<string?> Notes { get; set; }
}
