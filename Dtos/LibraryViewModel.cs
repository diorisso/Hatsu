namespace Hatsu.Dtos;

public class LibraryViewModel
{
    public List<EntryViewModel> Entries { get; set; } = new();
    public List<long> FavoriteGameIds { get; set; } = new();
}
