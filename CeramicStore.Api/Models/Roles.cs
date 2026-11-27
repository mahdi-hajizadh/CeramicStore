namespace CeramicStore.Api.Models;

public static class Roles
{
    public const string Customer = "Customer";
    public const string Admin = "Admin";
    public const string Owner = "Owner";

    // Both admins and owners can manage products.
    public const string Staff = "Admin,Owner";
}
