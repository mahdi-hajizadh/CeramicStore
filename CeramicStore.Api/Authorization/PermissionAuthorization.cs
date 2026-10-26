using CeramicStore.Api.Data;
using CeramicStore.Api.Extensions;
using CeramicStore.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Authorization;

// نام policy برای هر بخش پنل مدیریت (مثلاً perm:orders)
public static class PermissionPolicy
{
    public const string Prefix = "perm:";

    public static string For(string permission) => Prefix + permission;
}

// روی اکشن‌ها گذاشته می‌شود: [HasPermission(AdminPermissions.Orders)]
// Owner همیشه مجاز است؛ Admin فقط اگر صاحب فروشگاه آن بخش را برایش فعال کرده باشد.
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

        // مجوزها همیشه از دیتابیس خوانده می‌شوند تا تغییر دسترسی فوراً اعمال شود.
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
