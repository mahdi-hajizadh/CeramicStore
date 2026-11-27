using CeramicStore.Api.Authorization;
using CeramicStore.Api.Data;
using CeramicStore.Api.DTOs;
using CeramicStore.Api.Models;
using CeramicStore.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ImageStorage _storage;

    public ProductsController(AppDbContext context, ImageStorage storage)
    {
        _context = context;
        _storage = storage;
    }

    // GET: api/products
    // Return the total result count in the X-Total-Count header.
    [HttpGet]
    public async Task<ActionResult<List<Product>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        [FromQuery] bool descending = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || page > 100_000)
        {
            return BadRequest("شماره صفحه نامعتبر است.");
        }

        if (pageSize < 1 || pageSize > 100)
        {
            return BadRequest("تعداد محصولات هر صفحه باید بین ۱ تا ۱۰۰ باشد.");
        }

        var query = _context.Products.AsNoTracking();

        // Search product names and brands without case sensitivity.
        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{SearchHelpers.EscapeLike(search.Trim())}%";

            query = query.Where(p =>
                EF.Functions.ILike(p.Name, pattern) ||
                EF.Functions.ILike(p.Brand, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Use Id as a tie-breaker to keep pagination stable.
        IOrderedQueryable<Product> ordered = sortBy?.ToLowerInvariant() switch
        {
            "price" when descending =>
                query.OrderByDescending(p => p.PricePerSquareMeter),

            "price" =>
                query.OrderBy(p => p.PricePerSquareMeter),

            "stock" when descending =>
                query.OrderByDescending(p => p.Stock),

            "stock" =>
                query.OrderBy(p => p.Stock),

            "name" when descending =>
                query.OrderByDescending(p => p.Name),

            "name" =>
                query.OrderBy(p => p.Name),

            _ when descending =>
                query.OrderByDescending(p => p.Id),

            _ => query.OrderBy(p => p.Id)
        };

        ordered = ordered.ThenBy(p => p.Id);

        var products = await ordered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        Response.Headers["X-Total-Count"] = totalCount.ToString();

        return Ok(products);
    }

    // GET: api/products/stats
    [HttpGet("stats")]
    public async Task<ActionResult<ProductStatsDto>> GetStats(
        CancellationToken cancellationToken)
    {
        var total = await _context.Products.CountAsync(cancellationToken);
        var inStock = await _context.Products
            .CountAsync(p => p.Stock > 0, cancellationToken);

        return Ok(new ProductStatsDto(total, inStock, total - inStock));
    }

    // GET: api/products/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null)
        {
            return NotFound("محصول موردنظر پیدا نشد.");
        }

        return Ok(product);
    }

    // POST: api/products
    [HttpPost]
    [HasPermission(AdminPermissions.Products)]
    public async Task<ActionResult<Product>> Create(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name.Trim(),
            Brand = dto.Brand.Trim(),
            PricePerSquareMeter = dto.PricePerSquareMeter,
            BoxCoverage = dto.BoxCoverage,
            Stock = dto.Stock
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = product.Id },
            product
        );
    }

    // PUT: api/products/1
    // Use UpdateProductDto to prevent clients from changing Id or ImageUrl.
    [HttpPut("{id:int}")]
    [HasPermission(AdminPermissions.Products)]
    public async Task<ActionResult<Product>> Update(
        int id,
        UpdateProductDto dto)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null)
        {
            return NotFound("محصول موردنظر پیدا نشد.");
        }

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("نام محصول الزامی است.");
        }

        if (string.IsNullOrWhiteSpace(dto.Brand))
        {
            return BadRequest("نام برند الزامی است.");
        }

        product.Name = dto.Name.Trim();
        product.Brand = dto.Brand.Trim();
        product.PricePerSquareMeter = dto.PricePerSquareMeter;
        product.BoxCoverage = dto.BoxCoverage;
        product.Stock = dto.Stock;

        await _context.SaveChangesAsync();

        return Ok(product);
    }

    // POST: api/products/1/image
    [HttpPost("{id:int}/image")]
    [HasPermission(AdminPermissions.Products)]
    [RequestSizeLimit(ImageStorage.MaxImageBytes + 1024 * 1024)]
    public async Task<ActionResult<Product>> UploadImage(
        int id,
        IFormFile image,
        CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (product is null)
        {
            return NotFound("محصول موردنظر پیدا نشد.");
        }

        var (url, error) = await _storage.SaveAsync(image, cancellationToken);

        if (url is null)
        {
            return BadRequest(error);
        }

        var oldImageUrl = product.ImageUrl;
        product.ImageUrl = url;

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            // Remove the new upload if persisting the database change fails.
            _storage.Delete(url);
            throw;
        }

        // Delete the previous image only after the change is saved.
        _storage.Delete(oldImageUrl);

        return Ok(product);
    }

    // DELETE: api/products/1/image
    [HttpDelete("{id:int}/image")]
    [HasPermission(AdminPermissions.Products)]
    public async Task<ActionResult<Product>> DeleteImage(int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null)
        {
            return NotFound("محصول موردنظر پیدا نشد.");
        }

        var oldImageUrl = product.ImageUrl;
        product.ImageUrl = null;

        await _context.SaveChangesAsync();

        _storage.Delete(oldImageUrl);

        return Ok(product);
    }

    // DELETE: api/products/1
    [HttpDelete("{id:int}")]
    [HasPermission(AdminPermissions.Products)]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null)
        {
            return NotFound("محصول موردنظر پیدا نشد.");
        }

        var oldImageUrl = product.ImageUrl;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        // Remove the image file when deleting the product.
        _storage.Delete(oldImageUrl);

        return NoContent();
    }
}
