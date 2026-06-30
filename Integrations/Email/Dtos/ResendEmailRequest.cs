using System.Text.Json.Serialization;

namespace Hatsu.Integrations.Email.Dtos;

public class ResendEmailRequest
{
    [JsonPropertyName("from")]
    public string From { get; set; } = string.Empty;

    [JsonPropertyName("to")]
    public string[] To { get; set; } = Array.Empty<string>();

    [JsonPropertyName("subject")]
    public string Subject { get; set; } = string.Empty;

    [JsonPropertyName("html")]
    public string Html { get; set; } = string.Empty;
}
