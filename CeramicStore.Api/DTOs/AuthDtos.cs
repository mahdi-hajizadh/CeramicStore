using System.ComponentModel.DataAnnotations;
using CeramicStore.Api.Models;

namespace CeramicStore.Api.DTOs;

public class SendOtpDto
{
    [Required(ErrorMessage = "شماره موبایل الزامی است.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "نوع درخواست الزامی است.")]
    [RegularExpression("^(register|login|reset)$",
        ErrorMessage = "نوع درخواست باید register، login یا reset باشد.")]
    public string Purpose { get; set; } = string.Empty;
}

public class RegisterDto
{
    [Required(ErrorMessage = "شماره موبایل الزامی است.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "کد تأیید الزامی است.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "کد تأیید باید ۶ رقم باشد.")]
    public string Code { get; set; } = string.Empty;

    [Required(ErrorMessage = "رمز عبور الزامی است.")]
    [StringLength(100, MinimumLength = 8,
        ErrorMessage = "رمز عبور باید حداقل ۸ کاراکتر باشد.")]
    public string Password { get; set; } = string.Empty;

    [StringLength(100)]
    public string? FullName { get; set; }
}

public class LoginDto
{
    // نام کاربری ادمین/مالک یا شماره موبایل مشتری
    [Required(ErrorMessage = "نام کاربری یا موبایل الزامی است.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "رمز عبور الزامی است.")]
    public string Password { get; set; } = string.Empty;
}

public class LoginOtpDto
{
    [Required(ErrorMessage = "شماره موبایل الزامی است.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "کد تأیید الزامی است.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "کد تأیید باید ۶ رقم باشد.")]
    public string Code { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    [Required(ErrorMessage = "شماره موبایل الزامی است.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "کد تأیید الزامی است.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "کد تأیید باید ۶ رقم باشد.")]
    public string Code { get; set; } = string.Empty;

    [Required(ErrorMessage = "رمز عبور جدید الزامی است.")]
    [StringLength(100, MinimumLength = 8,
        ErrorMessage = "رمز عبور باید حداقل ۸ کاراکتر باشد.")]
    public string NewPassword { get; set; } = string.Empty;
}

public record SendOtpResponse(string Message, int ExpiresInSeconds, string? DevCode);

public record UserDto(int Id, string Username, string? FullName, string? Phone, string Role, string[] Permissions)
{
    public static UserDto From(AppUser user) =>
        new(user.Id, user.Username, user.FullName, user.Phone, user.Role,
            user.Role == Roles.Owner
                ? AdminPermissions.All.Select(p => p.Key).ToArray()
                : AdminPermissions.Parse(user.PermissionsJson));
}

public record AuthResponse(string Token, UserDto User);
