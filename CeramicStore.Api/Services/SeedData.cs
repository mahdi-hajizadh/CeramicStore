using CeramicStore.Api.Data;
using CeramicStore.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Services;

public static class SeedData
{
    // اگر هنوز صاحب فروشگاه (Owner) وجود ندارد، از تنظیمات Seed:OwnerUsername و
    // Seed:OwnerPassword اولین حساب Owner را می‌سازد.
    public static async Task EnsureOwnerAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("SeedData");

        var username = configuration["Seed:OwnerUsername"]?.Trim().ToLowerInvariant();
        var password = configuration["Seed:OwnerPassword"];

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrEmpty(password))
        {
            return;
        }

        try
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<AppUser>>();

            if (await context.Users.AnyAsync(u => u.Role == Roles.Owner))
            {
                return;
            }

            var owner = new AppUser
            {
                Username = username,
                Role = Roles.Owner,
                FullName = "صاحب فروشگاه"
            };

            owner.PasswordHash = hasher.HashPassword(owner, password);

            context.Users.Add(owner);
            await context.SaveChangesAsync();

            logger.LogInformation("حساب Owner با نام کاربری {Username} ساخته شد.", username);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex,
                "ساخت حساب Owner ناموفق بود. مطمئن شو migration دیتابیس اجرا شده است (dotnet ef database update).");
        }
    }
}
