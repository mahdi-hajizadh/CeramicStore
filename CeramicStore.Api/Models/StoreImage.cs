namespace CeramicStore.Api.Models;

// تصاویر خود فروشگاه (نه محصولات) برای گالری سایت
public class StoreImage
{
    public int Id { get; set; }

    public string ImageUrl { get; set; } = "";

    public string? Caption { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
