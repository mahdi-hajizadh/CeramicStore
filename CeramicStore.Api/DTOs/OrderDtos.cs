using System.ComponentModel.DataAnnotations;
using CeramicStore.Api.Models;

namespace CeramicStore.Api.DTOs;

public class OrderLineDto
{
    public int ProductId { get; set; }

    [Range(1, 10000, ErrorMessage = "تعداد کارتن باید بین ۱ تا ۱۰۰۰۰ باشد.")]
    public int Quantity { get; set; }
}

public class CreateOrderDto
{
    [Required(ErrorMessage = "سبد خرید خالی است.")]
    [MinLength(1, ErrorMessage = "سبد خرید خالی است.")]
    [MaxLength(100)]
    public List<OrderLineDto> Items { get; set; } = new();

    // یا شناسه یکی از آدرس‌های ذخیره‌شده، یا آدرس جدید
    public int? AddressId { get; set; }

    public ShippingAddressDto? Address { get; set; }

    [StringLength(500)]
    public string? Note { get; set; }
}

public class UpdateOrderStatusDto
{
    [Required]
    public OrderStatus Status { get; set; }
}

public record OrderItemDto(
    int ProductId,
    string ProductName,
    string Brand,
    decimal PricePerSquareMeter,
    decimal BoxCoverage,
    int Quantity,
    decimal LineTotal);

public record OrderDto(
    int Id,
    DateTime CreatedAt,
    string Status,
    string? Username,
    string RecipientName,
    string Phone,
    string Province,
    string City,
    string AddressLine,
    string PostalCode,
    string? Note,
    decimal TotalPrice,
    List<OrderItemDto> Items)
{
    public static OrderDto From(Order order) => new(
        order.Id,
        order.CreatedAt,
        order.Status.ToString(),
        order.User?.Username,
        order.RecipientName,
        order.Phone,
        order.Province,
        order.City,
        order.AddressLine,
        order.PostalCode,
        order.Note,
        order.TotalPrice,
        order.Items
            .Select(i => new OrderItemDto(
                i.ProductId,
                i.ProductName,
                i.Brand,
                i.PricePerSquareMeter,
                i.BoxCoverage,
                i.Quantity,
                i.Quantity * i.BoxCoverage * i.PricePerSquareMeter))
            .ToList());
}
