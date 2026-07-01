using System.ComponentModel.DataAnnotations;

namespace Hatsu.Dtos;

public class UpdateProfileRequest
{
    [Required]
    [MinLength(2)]
    [MaxLength(40)]
    public string Username { get; set; } = string.Empty;
}
