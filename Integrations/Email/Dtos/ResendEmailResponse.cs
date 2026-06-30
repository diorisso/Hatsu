using System.Text.Json.Serialization;

namespace Hatsu.Integrations.Email.Dtos;

public class ResendEmailResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
}
