using System.Security.Cryptography;
using CeramicStore.Api.Data;
using CeramicStore.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Services;

public class OtpService
{
    public const int CodeLength = 6;
    public static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(5);
    public static readonly TimeSpan ResendCooldown = TimeSpan.FromSeconds(60);
    public const int MaxAttempts = 5;

    private readonly AppDbContext _context;
    private readonly IPasswordHasher<AppUser> _hasher;
    private readonly ISmsSender _sms;
    private readonly SmsSender _smsConfig;

    public OtpService(
        AppDbContext context,
        IPasswordHasher<AppUser> hasher,
        ISmsSender sms,
        SmsSender smsConfig)
    {
        _context = context;
        _hasher = hasher;
        _sms = sms;
        _smsConfig = smsConfig;
    }

    public async Task<(bool Ok, string? Error, string? DevCode)> SendAsync(
        string phone,
        string purpose,
        CancellationToken cancellationToken)
    {
        purpose = purpose.Trim().ToLowerInvariant();

        if (!OtpPurposes.All.Contains(purpose))
            return (false, "نوع درخواست نامعتبر است.", null);

        var recent = await _context.OtpChallenges
            .Where(o => o.Phone == phone && o.Purpose == purpose && !o.Consumed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (recent is not null && DateTime.UtcNow - recent.CreatedAt < ResendCooldown)
        {
            var wait = (int)Math.Ceiling((ResendCooldown - (DateTime.UtcNow - recent.CreatedAt)).TotalSeconds);
            return (false, $"لطفاً {wait} ثانیه دیگر برای ارسال مجدد صبر کن.", null);
        }

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Phone == phone, cancellationToken);

        if (purpose == OtpPurposes.Register)
        {
            if (user is not null)
                return (false, "این شماره قبلاً ثبت شده است. وارد شو یا رمز را بازیابی کن.", null);
        }
        else
        {
            if (user is null)
                return (false, "حسابی با این شماره پیدا نشد.", null);

            if (user.Role != Roles.Customer)
                return (false, "ورود و بازیابی رمز با پیامک فقط برای مشتریان است.", null);
        }

        var code = GenerateCode();
        var probe = new AppUser { Username = phone };
        var challenge = new OtpChallenge
        {
            Phone = phone,
            Purpose = purpose,
            CodeHash = _hasher.HashPassword(probe, CodeMaterial(phone, purpose, code)),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.Add(CodeLifetime)
        };

        var old = await _context.OtpChallenges
            .Where(o => o.Phone == phone && o.Purpose == purpose && !o.Consumed)
            .ToListAsync(cancellationToken);

        foreach (var item in old)
            item.Consumed = true;

        _context.OtpChallenges.Add(challenge);
        await _context.SaveChangesAsync(cancellationToken);

        var message = purpose switch
        {
            OtpPurposes.Register => $"کد تأیید ثبت‌نام CeramicStore: {code}",
            OtpPurposes.Login => $"کد ورود CeramicStore: {code}",
            OtpPurposes.Reset => $"کد بازیابی رمز CeramicStore: {code}",
            _ => $"کد تأیید CeramicStore: {code}"
        };

        try
        {
            await _sms.SendAsync(phone, message, cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return (false, ex.Message, null);
        }

        return (true, null, _smsConfig.ExposeDevCode ? code : null);
    }

    public async Task<(bool Ok, string? Error)> VerifyAsync(
        string phone,
        string purpose,
        string code,
        bool consume,
        CancellationToken cancellationToken)
    {
        purpose = purpose.Trim().ToLowerInvariant();
        code = NormalizeDigits(code);

        if (code.Length != CodeLength || !code.All(char.IsDigit))
            return (false, "کد تأیید نامعتبر است.");

        var challenge = await _context.OtpChallenges
            .Where(o => o.Phone == phone && o.Purpose == purpose && !o.Consumed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (challenge is null)
            return (false, "کد تأیید یافت نشد. دوباره درخواست بده.");

        if (challenge.ExpiresAt < DateTime.UtcNow)
        {
            challenge.Consumed = true;
            await _context.SaveChangesAsync(cancellationToken);
            return (false, "کد تأیید منقضی شده است. دوباره درخواست بده.");
        }

        if (challenge.AttemptCount >= MaxAttempts)
        {
            challenge.Consumed = true;
            await _context.SaveChangesAsync(cancellationToken);
            return (false, "تعداد تلاش بیش از حد مجاز بود. دوباره کد بخواه.");
        }

        challenge.AttemptCount++;

        var probe = new AppUser { Username = phone };
        var result = _hasher.VerifyHashedPassword(
            probe,
            challenge.CodeHash,
            CodeMaterial(phone, purpose, code));

        if (result == PasswordVerificationResult.Failed)
        {
            await _context.SaveChangesAsync(cancellationToken);
            return (false, "کد تأیید نادرست است.");
        }

        if (consume)
            challenge.Consumed = true;

        await _context.SaveChangesAsync(cancellationToken);
        return (true, null);
    }

    private static string GenerateCode()
    {
        var value = RandomNumberGenerator.GetInt32(0, 1_000_000);
        return value.ToString($"D{CodeLength}");
    }

    private static string CodeMaterial(string phone, string purpose, string code) =>
        $"{phone}|{purpose}|{code}";

    private static string NormalizeDigits(string value)
    {
        Span<char> buffer = stackalloc char[value.Length];
        var i = 0;

        foreach (var ch in value.Trim())
        {
            if (ch is >= '0' and <= '9') buffer[i++] = ch;
            else if (ch is >= '۰' and <= '۹') buffer[i++] = (char)('0' + (ch - '۰'));
            else if (ch is >= '٠' and <= '٩') buffer[i++] = (char)('0' + (ch - '٠'));
        }

        return new string(buffer[..i]);
    }
}
