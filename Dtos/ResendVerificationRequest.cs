using System.ComponentModel.DataAnnotations;

namespace Hatsu.Dtos;

public class ResendVerificationRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
