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

    // برای کاربرِ ناموجود هم یک بررسی رمز انجام می‌شود تا زمان پاسخ، وجود نام کاربری را لو ندهد.
    private static readonly string DummyHash =
        new PasswordHasher<AppUser>().HashPassword(new AppUser(), Guid.NewGuid().ToString("N"));

    public AuthController(
        AppDbContext context,
        IPasswordHasher<AppUser> hasher,
        TokenService tokens)
    {
        _context = context;
        _hasher = hasher;
        _tokens = tokens;
    }

    // POST: api/auth/register  (فقط مشتری ساخته می‌شود)
    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterDto dto,
        CancellationToken cancellationToken)
    {
        var username = dto.Username.Trim().ToLowerInvariant();

        if (await _context.Users.AnyAsync(u => u.Username == username, cancellationToken))
        {
            return Conflict("این نام کاربری قبلاً ثبت شده است.");
        }

        var user = new AppUser
        {
            Username = username,
            Role = Roles.Customer,
            FullName = string.IsNullOrWhiteSpace(dto.FullName) ? null : dto.FullName.Trim(),
            Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim()
        };

        user.PasswordHash = _hasher.HashPassword(user, dto.Password);

        _context.Users.Add(user);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // ثبت‌نام همزمان با همین نام کاربری
            return Conflict("این نام کاربری قبلاً ثبت شده است.");
        }

        return Ok(new AuthResponse(_tokens.CreateToken(user), UserDto.From(user)));
    }

    // POST: api/auth/login
    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginDto dto,
        CancellationToken cancellationToken)
    {
        var username = dto.Username.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username, cancellationToken);

        const string failureMessage = "نام کاربری یا رمز عبور نادرست است.";

        if (user is null)
        {
            _hasher.VerifyHashedPassword(new AppUser(), DummyHash, dto.Password);
            return Unauthorized(failureMessage);
        }

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized(failureMessage);
        }

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _hasher.HashPassword(user, dto.Password);
            await _context.SaveChangesAsync(cancellationToken);
        }

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
        {
            return Unauthorized();
        }

        return Ok(UserDto.From(user));
    }
}
