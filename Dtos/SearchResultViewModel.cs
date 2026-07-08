using Hatsu.Models;

namespace Hatsu.Dtos;

public class SearchResultViewModel
{
    public GameResponse Game { get; set; } = null!;
    public EntryStatus? Status { get; set; }
}
