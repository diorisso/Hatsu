namespace Hatsu.Dtos;

public class ProfileViewModel
{
    public ProfileUserViewModel User { get; set; } = new();
    public bool IsSelf { get; set; }
    public bool IsFollowing { get; set; }
    public int FollowerCount { get; set; }
    public int FollowingCount { get; set; }
    public List<EntryViewModel> Entries { get; set; } = new();
    public List<GameSummary> Favorites { get; set; } = new();
}
