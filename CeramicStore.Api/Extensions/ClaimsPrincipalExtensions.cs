using System.Security.Claims;

namespace CeramicStore.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    // شناسه کاربر از claim با نام "sub" خوانده می‌شود.
    public static int GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirst("sub")?.Value;
        return int.TryParse(value, out var id) ? id : 0;
    }
}
