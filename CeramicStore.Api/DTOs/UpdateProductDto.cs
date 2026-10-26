using System.ComponentModel.DataAnnotations;

namespace CeramicStore.Api.DTOs;

public class UpdateProductDto
{
    [Required(ErrorMessage = "نام محصول الزامی است.")]
    [StringLength(150, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "نام برند الزامی است.")]
    [StringLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal PricePerSquareMeter { get; set; }

    [Range(typeof(decimal), "0.01", "10000")]
    public decimal BoxCoverage { get; set; }

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }
}