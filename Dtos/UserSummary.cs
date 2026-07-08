using Hatsu.Models;

namespace Hatsu.Dtos;

public class UserSummary
{
    public string Username { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }

    public static UserSummary From(User pUser, string pPublicBaseUrl)
    {
        var xReturn = new UserSummary
        {
            Username = pUser.Username,
            AvatarUrl = string.IsNullOrEmpty(pUser.AvatarKey)
                ? null
                : $"{pPublicBaseUrl.TrimEnd('/')}/{pUser.AvatarKey}",
            Bio = pUser.Bio
        };
        return xReturn;
    }
}
