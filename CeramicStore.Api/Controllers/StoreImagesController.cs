using CeramicStore.Api.Authorization;
using CeramicStore.Api.Data;
using CeramicStore.Api.Models;
using CeramicStore.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Controllers;

// تصاویر خود فروشگاه (گالری سایت)؛ جدا از تصاویر محصولات
[ApiController]
[Route("api/store-images")]
public class StoreImagesController : ControllerBase
{
    private const int MaxImages = 30;

    private readonly AppDbContext _context;
    private readonly ImageStorage _storage;

    public StoreImagesController(AppDbContext context, ImageStorage storage)
    {
        _context = context;
        _storage = storage;
    }

    // GET: api/store-images  (عمومی)
    [HttpGet]
    public async Task<ActionResult<List<StoreImage>>> GetAll(
        CancellationToken cancellationToken)
    {
        var images = await _context.StoreImages
            .AsNoTracking()
            .OrderBy(i => i.SortOrder)
            .ThenBy(i => i.Id)
            .ToListAsync(cancellationToken);

        return Ok(images);
    }

    // POST: api/store-images  (Owner یا ادمینِ دارای مجوز «تصاویر فروشگاه»)
    [HttpPost]
    [HasPermission(AdminPermissions.Gallery)]
    [RequestSizeLimit(ImageStorage.MaxImageBytes + 1024 * 1024)]
    public async Task<ActionResult<StoreImage>> Upload(
        IFormFile image,
        [FromForm] string? caption,
        CancellationToken cancellationToken)
    {
        var count = await _context.StoreImages.CountAsync(cancellationToken);

        if (count >= MaxImages)
        {
            return BadRequest($"حداکثر {MaxImages} تصویر برای گالری مجاز است.");
        }

        var (url, error) = await _storage.SaveAsync(image, cancellationToken);

        if (url is null)
        {
            return BadRequest(error);
        }

        var maxOrder = await _context.StoreImages
            .Select(i => (int?)i.SortOrder)
            .MaxAsync(cancellationToken) ?? 0;

        var entity = new StoreImage
        {
            ImageUrl = url,
            Caption = string.IsNullOrWhiteSpace(caption) ? null : caption.Trim(),
            SortOrder = maxOrder + 1
        };

        _context.StoreImages.Add(entity);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            _storage.Delete(url);
            throw;
        }

        return Ok(entity);
    }

    // DELETE: api/store-images/3  (Owner یا ادمینِ دارای مجوز «تصاویر فروشگاه»)
    [HttpDelete("{id:int}")]
    [HasPermission(AdminPermissions.Gallery)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var entity = await _context.StoreImages
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (entity is null)
        {
            return NotFound("تصویر پیدا نشد.");
        }

        var url = entity.ImageUrl;

        _context.StoreImages.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        _storage.Delete(url);

        return NoContent();
    }
}
