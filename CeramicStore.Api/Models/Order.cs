namespace CeramicStore.Api.Models;

public enum OrderStatus
{
    Pending,
    Processing,
    Shipped,
    Delivered,
    Cancelled
}

public class Order
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public AppUser? User { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    // آدرس به‌صورت نسخه ثابت در سفارش ذخیره می‌شود تا با تغییر آدرس‌های کاربر عوض نشود.
    public string RecipientName { get; set; } = "";

    public string Phone { get; set; } = "";

    public string Province { get; set; } = "";

    public string City { get; set; } = "";

    public string AddressLine { get; set; } = "";

    public string PostalCode { get; set; } = "";

    public string? Note { get; set; }

    public decimal TotalPrice { get; set; }

    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    // عمداً کلید خارجی نیست تا با حذف محصول، تاریخچه سفارش‌ها حفظ شود.
    public int ProductId { get; set; }

    public string ProductName { get; set; } = "";

    public string Brand { get; set; } = "";

    public decimal PricePerSquareMeter { get; set; }

    public decimal BoxCoverage { get; set; }

    // تعداد کارتن
    public int Quantity { get; set; }
}
