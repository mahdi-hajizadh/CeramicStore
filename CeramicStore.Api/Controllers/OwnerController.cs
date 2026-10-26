using CeramicStore.Api.Data;
using CeramicStore.Api.DTOs;
using CeramicStore.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Controllers;

// مدیریت حساب ادمین‌ها و مجوزهایشان؛ فقط برای صاحب فروشگاه
// (سفارش‌ها، مشتریان و گزارش‌ها در ManageController هستند.)
[ApiController]
[Route("api/owner")]
[Authorize(Roles = Roles.Owner)]
public class OwnerController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<AppUser> _hasher;

    public OwnerController(AppDbContext context, IPasswordHasher<AppUser> hasher)
    {
        _context = context;
        _hasher = hasher;
    }

    // GET: api/owner/staff
    [HttpGet("staff")]
    public async Task<ActionResult<List<StaffDto>>> GetStaff(
        CancellationToken cancellationToken)
    {
        var staff = await _context.Users
            .AsNoTracking()
            .Where(u => u.Role == Roles.Admin)
            .OrderBy(u => u.Id)
            .ToListAsync(cancellationToken);

        return Ok(staff.Select(StaffDto.From).ToList());
    }

    // POST: api/owner/staff  (ساخت ادمین)
    [HttpPost("staff")]
    public async Task<ActionResult<StaffDto>> CreateStaff(
        CreateStaffDto dto,
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
            Role = Roles.Admin,
            PermissionsJson = AdminPermissions.Serialize(new[] { AdminPermissions.Products }),
            FullName = string.IsNullOrWhiteSpace(dto.FullName) ? null : dto.FullName.Trim()
        };

        user.PasswordHash = _hasher.HashPassword(user, dto.Password);

        _context.Users.Add(user);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return Conflict("این نام کاربری قبلاً ثبت شده است.");
        }

        return Ok(StaffDto.From(user));
    }


    // PUT: api/owner/staff/7/permissions
    [HttpPut("staff/{id:int}/permissions")]
    public async Task<ActionResult<StaffDto>> UpdateStaffPermissions(
        int id, UpdateStaffPermissionsDto dto, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(
            u => u.Id == id && u.Role == Roles.Admin, cancellationToken);
        if (user is null) return NotFound("ادمین پیدا نشد.");

        var allowed = AdminPermissions.All.Select(p => p.Key).ToHashSet(StringComparer.Ordinal);
        if (dto.Permissions.Any(p => !allowed.Contains(p)))
            return BadRequest("یکی از مجوزهای ارسالی معتبر نیست.");

        user.PermissionsJson = AdminPermissions.Serialize(dto.Permissions);
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(StaffDto.From(user));
    }

    // DELETE: api/owner/staff/7  (فقط حساب‌های Admin قابل حذف‌اند)
    [HttpDelete("staff/{id:int}")]
    public async Task<IActionResult> DeleteStaff(int id, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == Roles.Admin, cancellationToken);

        if (user is null)
        {
            return NotFound("ادمین پیدا نشد.");
        }

        // سفارش‌ها به کاربر وابسته‌اند؛ حذف کاربرِ دارای سفارش باعث خطای دیتابیس می‌شد.
        if (await _context.Orders.AnyAsync(o => o.UserId == id, cancellationToken))
        {
            return Conflict("این ادمین سفارش ثبت کرده است و حذف نمی‌شود.");
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
