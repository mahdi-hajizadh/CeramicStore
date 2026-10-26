namespace CeramicStore.Api.Models;

public class AppUser
{
    public int Id { get; set; }

    // همیشه با حروف کوچک ذخیره می‌شود.
    public string Username { get; set; } = "";

    public string PasswordHash { get; set; } = "";

    public string Role { get; set; } = Roles.Customer;

    // JSON array of section keys granted to Admin accounts. Owner permissions are implicit.
    public string PermissionsJson { get; set; } = "[]";

    public string? FullName { get; set; }

    public string? Phone { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
