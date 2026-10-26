using System.ComponentModel.DataAnnotations;
using CeramicStore.Api.Models;

namespace CeramicStore.Api.DTOs;

public class UpdateSettingsDto
{
    [Required(ErrorMessage = "نام فروشگاه الزامی است.")]
    [StringLength(100, MinimumLength = 2)]
    public string StoreName { get; set; } = string.Empty;

    [Required(ErrorMessage = "شماره تماس الزامی است.")]
    [RegularExpression("^[0-9۰-۹+\\-\\s]{7,30}$",
        ErrorMessage = "شماره تماس معتبر نیست.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "نشانی فروشگاه الزامی است.")]
    [StringLength(400, MinimumLength = 3)]
    public string Address { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "ایمیل معتبر نیست.")]
    [StringLength(120)]
    public string? Email { get; set; }

    [StringLength(200)]
    public string? WorkingHours { get; set; }

    [StringLength(2000)]
    public string? About { get; set; }

    [StringLength(100)]
    public string? Instagram { get; set; }
}

public class CreateStaffDto
{
    [Required(ErrorMessage = "نام کاربری الزامی است.")]
    [RegularExpression("^[A-Za-z0-9_.]{3,30}$",
        ErrorMessage = "نام کاربری باید ۳ تا ۳۰ کاراکتر و فقط شامل حروف انگلیسی، عدد، _ و . باشد.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "رمز عبور الزامی است.")]
    [StringLength(100, MinimumLength = 8,
        ErrorMessage = "رمز عبور باید حداقل ۸ کاراکتر باشد.")]
    public string Password { get; set; } = string.Empty;

    [StringLength(100)]
    public string? FullName { get; set; }
}

public class UpdateStaffPermissionsDto
{
    public List<string> Permissions { get; set; } = new();
}

public record StaffDto(int Id, string Username, string? FullName, DateTime CreatedAt, string[] Permissions)
{
    public static StaffDto From(AppUser user) =>
        new(user.Id, user.Username, user.FullName, user.CreatedAt, AdminPermissions.Parse(user.PermissionsJson));
}
