using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using CeramicStore.Api.Models;

namespace CeramicStore.Api.DTOs;

public class RegisterDto
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

    [RegularExpression("^[0-9۰-۹+\\-\\s]{7,20}$",
        ErrorMessage = "شماره تلفن معتبر نیست.")]
    public string? Phone { get; set; }
}

public class LoginDto
{
    [Required(ErrorMessage = "نام کاربری الزامی است.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "رمز عبور الزامی است.")]
    public string Password { get; set; } = string.Empty;
}

public record UserDto(int Id, string Username, string? FullName, string? Phone, string Role, string[] Permissions)
{
    public static UserDto From(AppUser user) =>
        new(user.Id, user.Username, user.FullName, user.Phone, user.Role,
            user.Role == Roles.Owner ? AdminPermissions.All.Select(p => p.Key).ToArray() : AdminPermissions.Parse(user.PermissionsJson));
}

public record AuthResponse(string Token, UserDto User);
