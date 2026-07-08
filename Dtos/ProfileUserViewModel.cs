using Hatsu.Models;

namespace Hatsu.Dtos;

public class ProfileUserViewModel
{
    public string Username { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? BannerUrl { get; set; }
    public string? Bio { get; set; }

    public static ProfileUserViewModel From(User pUser, string pPublicBaseUrl)
    {
        var xBase = pPublicBaseUrl.TrimEnd('/');
        var xReturn = new ProfileUserViewModel
        {
            Username = pUser.Username,
            AvatarUrl = string.IsNullOrEmpty(pUser.AvatarKey) ? null : $"{xBase}/{pUser.AvatarKey}",
            BannerUrl = string.IsNullOrEmpty(pUser.BannerKey) ? null : $"{xBase}/{pUser.BannerKey}",
            Bio = pUser.Bio
        };
        return xReturn;
    }
}
