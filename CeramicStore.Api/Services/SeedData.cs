using System.Text.Json;
using CeramicStore.Api.Data;
using CeramicStore.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Services;

public static class SeedData
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

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

    // اگر جدول محصولات خالی باشد، ۲۰ محصول نمونه از فایل JSON وارد می‌شود.
    public static async Task EnsureProductsAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("SeedData");
        var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();

        try
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            if (await context.Products.AnyAsync())
            {
                return;
            }

            var path = ResolveProductsPath(env);

            if (path is null)
            {
                logger.LogWarning("فایل محصولات نمونه پیدا نشد؛ seed محصولات انجام نشد.");
                return;
            }

            await using var stream = File.OpenRead(path);
            var rows = await JsonSerializer.DeserializeAsync<List<SeedProductRow>>(stream, JsonOptions);

            if (rows is null || rows.Count == 0)
            {
                logger.LogWarning("فایل محصولات نمونه خالی بود.");
                return;
            }

            var products = rows.Select(row => new Product
            {
                Name = row.Name.Trim(),
                Brand = row.Brand.Trim(),
                PricePerSquareMeter = row.PricePerSquareMeter,
                BoxCoverage = row.BoxCoverage,
                Stock = row.Stock,
                ImageUrl = string.IsNullOrWhiteSpace(row.ImageUrl) ? null : row.ImageUrl.Trim()
            }).ToList();

            context.Products.AddRange(products);
            await context.SaveChangesAsync();

            logger.LogInformation("{Count} محصول نمونه وارد فروشگاه شد.", products.Count);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "وارد کردن محصولات نمونه ناموفق بود.");
        }
    }

    private static string? ResolveProductsPath(IHostEnvironment env)
    {
        var candidates = new[]
        {
            Path.Combine(env.ContentRootPath, "Data", "ceramicstore-products-20.json"),
            Path.Combine(AppContext.BaseDirectory, "Data", "ceramicstore-products-20.json"),
            Path.Combine(AppContext.BaseDirectory, "ceramicstore-products-20.json")
        };

        return candidates.FirstOrDefault(File.Exists);
    }

    private sealed class SeedProductRow
    {
        public string Name { get; set; } = "";
        public string Brand { get; set; } = "";
        public decimal PricePerSquareMeter { get; set; }
        public decimal BoxCoverage { get; set; }
        public int Stock { get; set; }
        public string? ImageUrl { get; set; }
    }
}
