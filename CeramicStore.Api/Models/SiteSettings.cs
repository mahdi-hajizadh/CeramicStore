namespace CeramicStore.Api.Models;

// Keep a single settings row with Id 1.
public class SiteSettings
{
    public int Id { get; set; }

    public string StoreName { get; set; } = "";

    public string Phone { get; set; } = "";

    public string Address { get; set; } = "";

    public string? Email { get; set; }

    public string? WorkingHours { get; set; }

    public string? About { get; set; }

    public string? Instagram { get; set; }

    // Store editable storefront content as JSON, including headers, hero, footer, guide, and legal pages.
    public string ContentJson { get; set; } = "{}";
}
