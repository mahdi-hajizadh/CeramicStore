using CeramicStore.Api.Data;
using CeramicStore.Api.DTOs;
using CeramicStore.Api.Extensions;
using CeramicStore.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/orders/mine
    [HttpGet("mine")]
    public async Task<ActionResult<List<OrderDto>>> GetMine(
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var orders = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.Id)
            .ToListAsync(cancellationToken);

        return Ok(orders.Select(OrderDto.From).ToList());
    }

    // POST: api/orders
    // قیمت و موجودی همیشه در سرور محاسبه می‌شود؛ مقادیر ارسالی کلاینت قابل اعتماد نیستند.
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(
        CreateOrderDto dto,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        // آدرس سفارش
        ShippingAddressDto? shipping = dto.Address;

        if (dto.AddressId is not null)
        {
            var saved = await _context.Addresses
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    a => a.Id == dto.AddressId && a.UserId == userId,
                    cancellationToken);

            if (saved is null)
            {
                return BadRequest("آدرس انتخاب‌شده پیدا نشد.");
            }

            shipping = new ShippingAddressDto
            {
                RecipientName = saved.RecipientName,
                Phone = saved.Phone,
                Province = saved.Province,
                City = saved.City,
                AddressLine = saved.AddressLine,
                PostalCode = saved.PostalCode
            };
        }

        if (shipping is null)
        {
            return BadRequest("آدرس تحویل را وارد یا انتخاب کن.");
        }

        // ادغام ردیف‌های تکراری یک محصول
        var lines = dto.Items
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(x => x.Quantity) })
            .ToList();

        var productIds = lines.Select(l => l.ProductId).ToList();

        var products = await _context.Products
            .AsNoTracking()
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        if (products.Count != productIds.Count)
        {
            return BadRequest("یکی از محصولات سبد خرید دیگر موجود نیست.");
        }

        var order = new Order
        {
            UserId = userId,
            RecipientName = shipping.RecipientName.Trim(),
            Phone = shipping.Phone.Trim(),
            Province = shipping.Province.Trim(),
            City = shipping.City.Trim(),
            AddressLine = shipping.AddressLine.Trim(),
            PostalCode = shipping.PostalCode.Trim(),
            Note = string.IsNullOrWhiteSpace(dto.Note) ? null : dto.Note.Trim()
        };

        await using var transaction =
            await _context.Database.BeginTransactionAsync(cancellationToken);

        foreach (var line in lines)
        {
            var product = products.First(p => p.Id == line.ProductId);
            var quantity = line.Quantity;

            // کم‌کردن اتمیک موجودی؛ اگر موجودی کافی نباشد هیچ ردیفی تغییر نمی‌کند.
            var affected = await _context.Products
                .Where(p => p.Id == product.Id && p.Stock >= quantity)
                .ExecuteUpdateAsync(
                    s => s.SetProperty(p => p.Stock, p => p.Stock - quantity),
                    cancellationToken);

            if (affected == 0)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Conflict($"موجودی «{product.Name}» برای این تعداد کافی نیست.");
            }

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Brand = product.Brand,
                PricePerSquareMeter = product.PricePerSquareMeter,
                BoxCoverage = product.BoxCoverage,
                Quantity = quantity
            });
        }

        order.TotalPrice = order.Items.Sum(
            i => i.Quantity * i.BoxCoverage * i.PricePerSquareMeter);

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return Ok(OrderDto.From(order));
    }

    // POST: api/orders/5/cancel  (فقط سفارش در انتظار خود کاربر)
    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<OrderDto>> Cancel(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId, cancellationToken);

        if (order is null)
        {
            return NotFound("سفارش پیدا نشد.");
        }

        if (order.Status != OrderStatus.Pending)
        {
            return BadRequest("فقط سفارش‌های در انتظار قابل لغو هستند.");
        }

        if (!await OrderStock.CancelAsync(_context, order, cancellationToken))
        {
            return Conflict("وضعیت سفارش هم‌زمان تغییر کرد؛ صفحه را تازه کن.");
        }

        return Ok(OrderDto.From(order));
    }
}

// لغو سفارش و بازگرداندن موجودی کارتن‌ها به انبار.
// تغییر وضعیت با شرط «وضعیت هنوز همان است» انجام می‌شود؛ پس اگر دو درخواست لغو
// هم‌زمان برسند، موجودی فقط یک بار برمی‌گردد.
public static class OrderStock
{
    public static async Task<bool> CancelAsync(
        AppDbContext context,
        Order order,
        CancellationToken cancellationToken)
    {
        var expectedStatus = order.Status;

        await using var transaction =
            await context.Database.BeginTransactionAsync(cancellationToken);

        var changed = await context.Orders
            .Where(o => o.Id == order.Id && o.Status == expectedStatus)
            .ExecuteUpdateAsync(
                s => s.SetProperty(o => o.Status, OrderStatus.Cancelled),
                cancellationToken);

        if (changed == 0)
        {
            await transaction.RollbackAsync(cancellationToken);
            return false;
        }

        foreach (var item in order.Items)
        {
            var quantity = item.Quantity;

            await context.Products
                .Where(p => p.Id == item.ProductId)
                .ExecuteUpdateAsync(
                    s => s.SetProperty(p => p.Stock, p => p.Stock + quantity),
                    cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);

        order.Status = OrderStatus.Cancelled;
        context.Entry(order).State = EntityState.Unchanged;

        return true;
    }
}
