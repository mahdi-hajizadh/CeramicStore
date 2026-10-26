using System.ComponentModel.DataAnnotations;

namespace CeramicStore.Api.DTOs;

public class ShippingAddressDto
{
    [Required(ErrorMessage = "نام گیرنده الزامی است.")]
    [StringLength(100, MinimumLength = 2)]
    public string RecipientName { get; set; } = string.Empty;

    [Required(ErrorMessage = "شماره تماس گیرنده الزامی است.")]
    [RegularExpression("^[0-9۰-۹+\\-\\s]{7,20}$",
        ErrorMessage = "شماره تماس معتبر نیست.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "استان الزامی است.")]
    [StringLength(60)]
    public string Province { get; set; } = string.Empty;

    [Required(ErrorMessage = "شهر الزامی است.")]
    [StringLength(60)]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "نشانی کامل الزامی است.")]
    [StringLength(400, MinimumLength = 8,
        ErrorMessage = "نشانی باید حداقل ۸ کاراکتر باشد.")]
    public string AddressLine { get; set; } = string.Empty;

    [Required(ErrorMessage = "کد پستی الزامی است.")]
    [RegularExpression("^[0-9۰-۹]{10}$",
        ErrorMessage = "کد پستی باید ۱۰ رقم باشد.")]
    public string PostalCode { get; set; } = string.Empty;
}
