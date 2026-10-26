
using System.ComponentModel.DataAnnotations;

namespace CeramicStore.Api.Models;

public class Product
{
    public int Id { get; set; }

    [Required(ErrorMessage = "نام محصول الزامی است.")]
    [StringLength(150, MinimumLength = 2,
        ErrorMessage = "نام محصول باید بین ۲ تا ۱۵۰ کاراکتر باشد.")]
    public string Name { get; set; } = "";

    [Required(ErrorMessage = "نام برند الزامی است.")]
    [StringLength(100,
        ErrorMessage = "نام برند نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.")]
    public string Brand { get; set; } = "";

    [Range(typeof(decimal), "0.01", "999999999",
        ErrorMessage = "قیمت هر متر مربع باید بیشتر از صفر باشد.")]
    public decimal PricePerSquareMeter { get; set; }

    [Range(typeof(decimal), "0.01", "10000",
        ErrorMessage = "متراژ پوشش کارتن باید بیشتر از صفر باشد.")]
    public decimal BoxCoverage { get; set; }

    [Range(0, int.MaxValue,
        ErrorMessage = "موجودی نمی‌تواند منفی باشد.")]
    public int Stock { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }
}
