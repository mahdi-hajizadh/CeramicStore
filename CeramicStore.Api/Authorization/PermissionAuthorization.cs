using CeramicStore.Api.Data;
using CeramicStore.Api.Extensions;
using CeramicStore.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Authorization;

// Policy name for each management area, such as perm:orders.
public static class PermissionPolicy
{
    public const string Prefix = "perm:";

    public static string For(string permission) => Prefix + permission;
}

// Apply to actions with [HasPermission(AdminPermissions.Orders)].
// Owners always have access. Admins need permission for the requested area.
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public sealed class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(string permission)
    {
        Policy = PermissionPolicy.For(permission);
    }
}

public sealed class PermissionRequirement : IAuthorizationRequirement
{
    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }

    public string Permission { get; }
}

public sealed class PermissionHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly AppDbContext _context;

    public PermissionHandler(AppDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (context.User.IsInRole(Roles.Owner))
        {
            context.Succeed(requirement);
            return;
        }

        if (!context.User.IsInRole(Roles.Admin))
        {
            return;
        }

        var userId = context.User.GetUserId();

        // Read permissions from the database so changes take effect immediately.
        var json = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == userId && u.Role == Roles.Admin)
            .Select(u => u.PermissionsJson)
            .FirstOrDefaultAsync();

        if (AdminPermissions.Parse(json).Contains(requirement.Permission))
        {
            context.Succeed(requirement);
        }
    }
}
