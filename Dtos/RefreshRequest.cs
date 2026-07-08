using System.ComponentModel.DataAnnotations;

namespace Hatsu.Dtos;

public class RefreshRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
