using CeramicStore.Api.Data;
using CeramicStore.Api.DTOs;
using CeramicStore.Api.Extensions;
using CeramicStore.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Controllers;

[ApiController]
[Route("api/addresses")]
[Authorize]
public class AddressesController : ControllerBase
{
    private const int MaxAddressesPerUser = 10;

    private readonly AppDbContext _context;

    public AddressesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/addresses
    [HttpGet]
    public async Task<ActionResult<List<Address>>> GetMine(
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var addresses = await _context.Addresses
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.Id)
            .ToListAsync(cancellationToken);

        return Ok(addresses);
    }

    // POST: api/addresses
    [HttpPost]
    public async Task<ActionResult<Address>> Create(
        ShippingAddressDto dto,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var count = await _context.Addresses
            .CountAsync(a => a.UserId == userId, cancellationToken);

        if (count >= MaxAddressesPerUser)
        {
            return BadRequest($"حداکثر {MaxAddressesPerUser} آدرس می‌توانی ذخیره کنی.");
        }

        var address = new Address
        {
            UserId = userId,
            RecipientName = dto.RecipientName.Trim(),
            Phone = dto.Phone.Trim(),
            Province = dto.Province.Trim(),
            City = dto.City.Trim(),
            AddressLine = dto.AddressLine.Trim(),
            PostalCode = dto.PostalCode.Trim()
        };

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(address);
    }

    // DELETE: api/addresses/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId, cancellationToken);

        if (address is null)
        {
            return NotFound("آدرس پیدا نشد.");
        }

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
