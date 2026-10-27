using CeramicStore.Api.Data;
using CeramicStore.Api.DTOs;
using CeramicStore.Api.Extensions;
using CeramicStore.Api.Models;
using CeramicStore.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<AppUser> _hasher;
    private readonly TokenService _tokens;
    private readonly OtpService _otp;

    // برای کاربرِ ناموجود هم یک بررسی رمز انجام می‌شود تا زمان پاسخ، وجود نام کاربری را لو ندهد.
    private static readonly string DummyHash =
        new PasswordHasher<AppUser>().HashPassword(new AppUser(), Guid.NewGuid().ToString("N"));

    public AuthController(
        AppDbContext context,
        IPasswordHasher<AppUser> hasher,
        TokenService tokens,
        OtpService otp)
    {
        _context = context;
        _hasher = hasher;
        _tokens = tokens;
        _otp = otp;
    }

    // POST: api/auth/otp/send
    [HttpPost("otp/send")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<SendOtpResponse>> SendOtp(
        SendOtpDto dto,
        CancellationToken cancellationToken)
    {
        var phone = PhoneNormalizer.NormalizeMobile(dto.Phone);

        if (phone is null)
            return BadRequest("شماره موبایل معتبر نیست. مثال: 09123456789");

        var (ok, error, devCode) = await _otp.SendAsync(phone, dto.Purpose, cancellationToken);

        if (!ok)
            return BadRequest(error);

        return Ok(new SendOtpResponse(
            "کد تأیید پیامک شد.",
            (int)OtpService.CodeLifetime.TotalSeconds,
            devCode));
    }

    // POST: api/auth/register  (ثبت‌نام مشتری با موبایل + کد پیامک)
    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterDto dto,
        CancellationToken cancellationToken)
    {
        var phone = PhoneNormalizer.NormalizeMobile(dto.Phone);

        if (phone is null)
            return BadRequest("شماره موبایل معتبر نیست. مثال: 09123456789");

        var (ok, error) = await _otp.VerifyAsync(
            phone, OtpPurposes.Register, dto.Code, consume: true, cancellationToken);

        if (!ok)
            return BadRequest(error);

        if (await _context.Users.AnyAsync(
                u => u.Phone == phone || u.Username == phone, cancellationToken))
        {
            return Conflict("این شماره قبلاً ثبت شده است.");
        }

        var user = new AppUser
        {
            Username = phone,
            Role = Roles.Customer,
            FullName = string.IsNullOrWhiteSpace(dto.FullName) ? null : dto.FullName.Trim(),
            Phone = phone
        };

        user.PasswordHash = _hasher.HashPassword(user, dto.Password);

        _context.Users.Add(user);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return Conflict("این شماره قبلاً ثبت شده است.");
        }

        return Ok(new AuthResponse(_tokens.CreateToken(user), UserDto.From(user)));
    }

    // POST: api/auth/login  (نام کاربری/موبایل + رمز)
    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginDto dto,
        CancellationToken cancellationToken)
    {
        var identifier = dto.Username.Trim().ToLowerInvariant();
        var phone = PhoneNormalizer.NormalizeMobile(dto.Username);

        var user = await _context.Users.FirstOrDefaultAsync(
            u => u.Username == identifier || (phone != null && u.Phone == phone),
            cancellationToken);

        const string failureMessage = "نام کاربری/موبایل یا رمز عبور نادرست است.";

        if (user is null)
        {
            _hasher.VerifyHashedPassword(new AppUser(), DummyHash, dto.Password);
            return Unauthorized(failureMessage);
        }

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);

        if (result == PasswordVerificationResult.Failed)
            return Unauthorized(failureMessage);

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _hasher.HashPassword(user, dto.Password);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Ok(new AuthResponse(_tokens.CreateToken(user), UserDto.From(user)));
    }

    // POST: api/auth/login-otp  (ورود مشتری فقط با کد پیامک)
    [HttpPost("login-otp")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> LoginOtp(
        LoginOtpDto dto,
        CancellationToken cancellationToken)
    {
        var phone = PhoneNormalizer.NormalizeMobile(dto.Phone);

        if (phone is null)
            return BadRequest("شماره موبایل معتبر نیست. مثال: 09123456789");

        var (ok, error) = await _otp.VerifyAsync(
            phone, OtpPurposes.Login, dto.Code, consume: true, cancellationToken);

        if (!ok)
            return BadRequest(error);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Phone == phone && u.Role == Roles.Customer, cancellationToken);

        if (user is null)
            return Unauthorized("حسابی با این شماره پیدا نشد.");

        return Ok(new AuthResponse(_tokens.CreateToken(user), UserDto.From(user)));
    }

    // POST: api/auth/reset-password
    [HttpPost("reset-password")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> ResetPassword(
        ResetPasswordDto dto,
        CancellationToken cancellationToken)
    {
        var phone = PhoneNormalizer.NormalizeMobile(dto.Phone);

        if (phone is null)
            return BadRequest("شماره موبایل معتبر نیست. مثال: 09123456789");

        var (ok, error) = await _otp.VerifyAsync(
            phone, OtpPurposes.Reset, dto.Code, consume: true, cancellationToken);

        if (!ok)
            return BadRequest(error);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Phone == phone && u.Role == Roles.Customer, cancellationToken);

        if (user is null)
            return NotFound("حسابی با این شماره پیدا نشد.");

        user.PasswordHash = _hasher.HashPassword(user, dto.NewPassword);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new AuthResponse(_tokens.CreateToken(user), UserDto.From(user)));
    }

    // GET: api/auth/me
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Me(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null)
            return Unauthorized();

        return Ok(UserDto.From(user));
    }
}
