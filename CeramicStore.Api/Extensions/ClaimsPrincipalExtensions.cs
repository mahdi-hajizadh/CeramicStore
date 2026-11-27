using System.Security.Claims;

namespace CeramicStore.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    // Read the user ID from the "sub" claim.
    public static int GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirst("sub")?.Value;
        return int.TryParse(value, out var id) ? id : 0;
    }
}
