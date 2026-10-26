using CeramicStore.Api.Authorization;
using CeramicStore.Api.Data;
using CeramicStore.Api.DTOs;
using CeramicStore.Api.Models;
using CeramicStore.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Controllers;

// بخش‌های مدیریتی که با مجوز قابل واگذاری به ادمین‌ها هستند (سفارش‌ها، مشتریان، گزارش فروش).
// Owner همیشه دسترسی دارد؛ Admin فقط با مجوز مربوط به همان بخش.
[ApiController]
[Route("api/manage")]
public class ManageController : ControllerBase
{
    private readonly AppDbContext _context;

    public ManageController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/manage/orders?status=Pending&page=1&pageSize=10
    [HttpGet("orders")]
    [HasPermission(AdminPermissions.Orders)]
    public async Task<ActionResult<List<OrderDto>>> GetOrders(
        [FromQuery] OrderStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || page > 100_000 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest("پارامترهای صفحه‌بندی نامعتبر است.");
        }

        var query = _context.Orders.AsNoTracking();

        if (status is not null)
        {
            query = query.Where(o => o.Status == status);
        }

        var total = await query.CountAsync(cancellationToken);

        var orders = await query
            .Include(o => o.Items)
            .Include(o => o.User)
            .OrderByDescending(o => o.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        Response.Headers["X-Total-Count"] = total.ToString();

        return Ok(orders.Select(OrderDto.From).ToList());
    }

    // PUT: api/manage/orders/5/status
    [HttpPut("orders/{id:int}/status")]
    [HasPermission(AdminPermissions.Orders)]
    public async Task<ActionResult<OrderDto>> UpdateOrderStatus(
        int id,
        UpdateOrderStatusDto dto,
        CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order is null)
        {
            return NotFound("سفارش پیدا نشد.");
        }

        if (order.Status == dto.Status)
        {
            return Ok(OrderDto.From(order));
        }

        if (order.Status == OrderStatus.Cancelled)
        {
            return BadRequest("سفارش لغوشده دیگر قابل تغییر نیست.");
        }

        const string raceMessage = "وضعیت سفارش هم‌زمان تغییر کرد؛ صفحه را تازه کن.";

        if (dto.Status == OrderStatus.Cancelled)
        {
            if (order.Status == OrderStatus.Delivered)
            {
                return BadRequest("سفارش تحویل‌شده قابل لغو نیست.");
            }

            if (!await OrderStock.CancelAsync(_context, order, cancellationToken))
            {
                return Conflict(raceMessage);
            }

            return Ok(OrderDto.From(order));
        }

        // اگر مشتری هم‌زمان سفارش را لغو کرده باشد، سفارش لغوشده دوباره زنده نمی‌شود.
        var expected = order.Status;

        var changed = await _context.Orders
            .Where(o => o.Id == id && o.Status == expected)
            .ExecuteUpdateAsync(
                s => s.SetProperty(o => o.Status, dto.Status),
                cancellationToken);

        if (changed == 0)
        {
            return Conflict(raceMessage);
        }

        order.Status = dto.Status;
        _context.Entry(order).State = EntityState.Unchanged;

        return Ok(OrderDto.From(order));
    }

    // GET: api/manage/customers?search=ali&page=1&pageSize=10
    [HttpGet("customers")]
    [HasPermission(AdminPermissions.Customers)]
    public async Task<ActionResult<List<CustomerDto>>> GetCustomers(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || page > 100_000 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest("پارامترهای صفحه‌بندی نامعتبر است.");
        }

        var query = _context.Users
            .AsNoTracking()
            .Where(u => u.Role == Roles.Customer);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{SearchHelpers.EscapeLike(search.Trim())}%";

            query = query.Where(u =>
                EF.Functions.ILike(u.Username, pattern) ||
                (u.FullName != null && EF.Functions.ILike(u.FullName, pattern)) ||
                (u.Phone != null && EF.Functions.ILike(u.Phone, pattern)));
        }

        var total = await query.CountAsync(cancellationToken);

        var customers = await query
            .OrderByDescending(u => u.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new CustomerDto(
                u.Id,
                u.Username,
                u.FullName,
                u.Phone,
                u.CreatedAt,
                _context.Orders.Count(o => o.UserId == u.Id),
                _context.Orders
                    .Where(o => o.UserId == u.Id && o.Status != OrderStatus.Cancelled)
                    .Sum(o => (decimal?)o.TotalPrice) ?? 0m))
            .ToListAsync(cancellationToken);

        Response.Headers["X-Total-Count"] = total.ToString();

        return Ok(customers);
    }

    // GET: api/manage/reports/sales
    // سفارش‌های لغوشده در درآمد و پرفروش‌ها حساب نمی‌شوند.
    [HttpGet("reports/sales")]
    [HasPermission(AdminPermissions.Reports)]
    public async Task<ActionResult<SalesReportDto>> GetSalesReport(
        CancellationToken cancellationToken)
    {
        var byStatus = await _context.Orders
            .AsNoTracking()
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var ordersByStatus = Enum.GetValues<OrderStatus>()
            .ToDictionary(
                status => status.ToString(),
                status => byStatus.FirstOrDefault(x => x.Status == status)?.Count ?? 0);

        var activeOrders = byStatus
            .Where(x => x.Status != OrderStatus.Cancelled)
            .Sum(x => x.Count);

        var revenue = await _context.Orders
            .AsNoTracking()
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SumAsync(o => (decimal?)o.TotalPrice, cancellationToken) ?? 0m;

        var customerCount = await _context.Users
            .CountAsync(u => u.Role == Roles.Customer, cancellationToken);

        // مرتب‌سازی قبل از تبدیل به DTO انجام می‌شود تا ترجمه به SQL مطمئن باشد.
        var topRows = await _context.Orders
            .AsNoTracking()
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SelectMany(o => o.Items)
            .GroupBy(i => new { i.ProductId, i.ProductName })
            .Select(g => new
            {
                g.Key.ProductId,
                g.Key.ProductName,
                Boxes = g.Sum(i => i.Quantity),
                Revenue = g.Sum(i => i.Quantity * i.BoxCoverage * i.PricePerSquareMeter)
            })
            .OrderByDescending(x => x.Revenue)
            .Take(5)
            .ToListAsync(cancellationToken);

        var topProducts = topRows
            .Select(x => new TopProductDto(x.ProductId, x.ProductName, x.Boxes, x.Revenue))
            .ToList();

        // فروش ۳۰ روز اخیر؛ تعداد سفارش‌ها کم است و گروه‌بندی در حافظه ساده‌تر و مطمئن‌تر است.
        var since = DateTime.UtcNow.Date.AddDays(-29);

        var recent = await _context.Orders
            .AsNoTracking()
            .Where(o => o.Status != OrderStatus.Cancelled && o.CreatedAt >= since)
            .Select(o => new { o.CreatedAt, o.TotalPrice })
            .ToListAsync(cancellationToken);

        var daily = Enumerable.Range(0, 30)
            .Select(offset => since.AddDays(offset))
            .Select(day =>
            {
                var ofDay = recent.Where(o => o.CreatedAt.Date == day).ToList();

                return new DailySalesDto(
                    DateOnly.FromDateTime(day),
                    ofDay.Count,
                    ofDay.Sum(o => o.TotalPrice));
            })
            .ToList();

        return Ok(new SalesReportDto(
            byStatus.Sum(x => x.Count),
            activeOrders,
            revenue,
            customerCount,
            ordersByStatus,
            topProducts,
            daily));
    }
}
