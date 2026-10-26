namespace CeramicStore.Api.Models;

public static class Roles
{
    public const string Customer = "Customer";
    public const string Admin = "Admin";
    public const string Owner = "Owner";

    // Admin و Owner هر دو می‌توانند محصولات را مدیریت کنند.
    public const string Staff = "Admin,Owner";
}
