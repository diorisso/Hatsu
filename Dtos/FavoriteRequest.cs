using System.ComponentModel.DataAnnotations;

namespace Hatsu.Dtos;

public class FavoriteRequest
{
    [Range(1, long.MaxValue)]
    public long GameId { get; set; }
}
