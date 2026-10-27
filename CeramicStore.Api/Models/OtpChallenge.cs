namespace CeramicStore.Api.Models;

public static class OtpPurposes
{
    public const string Register = "register";
    public const string Login = "login";
    public const string Reset = "reset";

    public static readonly HashSet<string> All = new(StringComparer.OrdinalIgnoreCase)
    {
        Register, Login, Reset
    };
}

public class OtpChallenge
{
    public int Id { get; set; }

    public string Phone { get; set; } = "";

    public string Purpose { get; set; } = "";

    public string CodeHash { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; }

    public int AttemptCount { get; set; }

    public bool Consumed { get; set; }
}
