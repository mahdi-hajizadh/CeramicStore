using System.Text.Json;

namespace CeramicStore.Api.Models;

public static class AdminPermissions
{
    public const string Products = "products";
    public const string Orders = "orders";
    public const string Customers = "customers";
    public const string Reports = "reports";
    public const string Gallery = "gallery";
    public const string Settings = "settings";

    public static readonly (string Key, string Label)[] All =
    {
        (Products, "مدیریت محصولات"),
        (Orders, "مدیریت سفارش‌ها"),
        (Customers, "مشاهده مشتریان"),
        (Reports, "گزارش فروش"),
        (Gallery, "تصاویر فروشگاه"),
        (Settings, "تنظیمات فروشگاه")
    };

    public static string[] Parse(string? json)
    {
        try { return JsonSerializer.Deserialize<string[]>(json ?? "[]") ?? Array.Empty<string>(); }
        catch (JsonException) { return Array.Empty<string>(); }
    }

    public static string Serialize(IEnumerable<string>? permissions) =>
        JsonSerializer.Serialize((permissions ?? Array.Empty<string>())
            .Where(p => All.Any(x => x.Key == p)).Distinct().ToArray());
}
