using System.Text.Json;

namespace CeramicStore.Api.Services;

// در Development یا بدون ApiKey فقط لاگ می‌کند؛ با Kavenegar ارسال واقعی می‌زند.
public sealed class SmsSender : ISmsSender
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SmsSender> _logger;
    private readonly IHostEnvironment _environment;

    public SmsSender(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<SmsSender> logger,
        IHostEnvironment environment)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _environment = environment;
    }

    public async Task SendAsync(string phone, string message, CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["Sms:ApiKey"];
        var provider = _configuration["Sms:Provider"] ?? "Console";

        if (string.IsNullOrWhiteSpace(apiKey) ||
            provider.Equals("Console", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("SMS → {Phone}: {Message}", phone, message);
            return;
        }

        if (provider.Equals("Kavenegar", StringComparison.OrdinalIgnoreCase))
        {
            await SendKavenegarAsync(apiKey, phone, message, cancellationToken);
            return;
        }

        _logger.LogWarning("ارائه‌دهنده پیامک ناشناخته: {Provider}. پیام لاگ شد.", provider);
        _logger.LogInformation("SMS → {Phone}: {Message}", phone, message);
    }

    private async Task SendKavenegarAsync(
        string apiKey,
        string phone,
        string message,
        CancellationToken cancellationToken)
    {
        var receptor = phone.StartsWith('0') ? "98" + phone[1..] : phone;
        var sender = _configuration["Sms:Sender"] ?? "";
        var client = _httpClientFactory.CreateClient("sms");

        var url =
            $"https://api.kavenegar.com/v1/{Uri.EscapeDataString(apiKey)}/sms/send.json" +
            $"?receptor={Uri.EscapeDataString(receptor)}" +
            $"&message={Uri.EscapeDataString(message)}" +
            (string.IsNullOrWhiteSpace(sender) ? "" : $"&sender={Uri.EscapeDataString(sender)}");

        using var response = await client.GetAsync(url, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("ارسال پیامک کاوه‌نگار ناموفق بود ({Status}): {Body}",
                (int)response.StatusCode, body);
            throw new InvalidOperationException("ارسال پیامک ناموفق بود. کمی بعد دوباره تلاش کن.");
        }

        try
        {
            using var doc = JsonDocument.Parse(body);
            var returnStatus = doc.RootElement
                .GetProperty("return")
                .GetProperty("status")
                .GetInt32();

            if (returnStatus != 200)
            {
                _logger.LogError("کاوه‌نگار وضعیت غیرموفق برگرداند: {Body}", body);
                throw new InvalidOperationException("ارسال پیامک ناموفق بود. کمی بعد دوباره تلاش کن.");
            }
        }
        catch (InvalidOperationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "پاسخ کاوه‌نگار قابل‌خواندن نبود؛ با فرض موفقیت ادامه می‌دهیم. {Body}", body);
        }
    }

    public bool ExposeDevCode =>
        _environment.IsDevelopment() ||
        string.Equals(_configuration["Sms:ExposeDevCode"], "true", StringComparison.OrdinalIgnoreCase);
}
