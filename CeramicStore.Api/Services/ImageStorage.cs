namespace CeramicStore.Api.Services;

// ذخیره و حذف تصاویر آپلودشده (محصولات و گالری فروشگاه)
public class ImageStorage
{
    public const long MaxImageBytes = 5 * 1024 * 1024;
    public const string RequestPath = "/uploads/";

    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ImageStorage> _logger;

    public ImageStorage(
        IWebHostEnvironment environment,
        ILogger<ImageStorage> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    // خروجی: آدرس نسبی تصویر یا پیام خطا
    public async Task<(string? Url, string? Error)> SaveAsync(
        IFormFile? image,
        CancellationToken cancellationToken = default)
    {
        if (image is null || image.Length == 0)
        {
            return (null, "یک تصویر انتخاب کن.");
        }

        if (image.Length > MaxImageBytes)
        {
            return (null, "حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
        }

        string? extension;

        await using (var headerStream = image.OpenReadStream())
        {
            extension = await DetectExtensionAsync(headerStream, cancellationToken);
        }

        if (extension is null)
        {
            return (null, "فرمت مجاز تصویر فقط JPG، PNG یا WEBP است.");
        }

        var folder = GetUploadsFolder();
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var path = Path.Combine(folder, fileName);

        await using (var stream = File.Create(path))
        {
            await image.CopyToAsync(stream, cancellationToken);
        }

        return ($"{RequestPath}{fileName}", null);
    }

    public void Delete(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl) ||
            !imageUrl.StartsWith(RequestPath, StringComparison.Ordinal))
        {
            return;
        }

        try
        {
            // Path.GetFileName جلوی دستکاری مسیر (Path Traversal) را می‌گیرد.
            var path = Path.Combine(GetUploadsFolder(), Path.GetFileName(imageUrl));

            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "حذف فایل تصویر {ImageUrl} ناموفق بود.", imageUrl);
        }
    }

    private string GetUploadsFolder()
    {
        var webRoot = _environment.WebRootPath
            ?? Path.Combine(_environment.ContentRootPath, "wwwroot");

        return Path.Combine(webRoot, "uploads");
    }

    // نوع واقعی فایل از روی بایت‌های ابتدایی آن تشخیص داده می‌شود.
    private static async Task<string?> DetectExtensionAsync(
        Stream stream,
        CancellationToken cancellationToken)
    {
        var header = new byte[12];
        var read = 0;

        while (read < header.Length)
        {
            var count = await stream.ReadAsync(
                header.AsMemory(read), cancellationToken);

            if (count == 0)
            {
                break;
            }

            read += count;
        }

        if (read < 12)
        {
            return null;
        }

        if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
        {
            return ".jpg";
        }

        if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E &&
            header[3] == 0x47 && header[4] == 0x0D && header[5] == 0x0A &&
            header[6] == 0x1A && header[7] == 0x0A)
        {
            return ".png";
        }

        if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 &&
            header[3] == 0x46 && header[8] == 0x57 && header[9] == 0x45 &&
            header[10] == 0x42 && header[11] == 0x50)
        {
            return ".webp";
        }

        return null;
    }
}
