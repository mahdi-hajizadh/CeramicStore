namespace CeramicStore.Api.Models;

// همیشه فقط یک ردیف (Id = 1) وجود دارد.
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
}
