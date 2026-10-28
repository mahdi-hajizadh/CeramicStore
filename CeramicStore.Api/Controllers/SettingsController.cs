using System.Text.Json;
using CeramicStore.Api.Authorization;
using CeramicStore.Api.Data;
using CeramicStore.Api.DTOs;
using CeramicStore.Api.Models;
using CeramicStore.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SettingsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/settings  (عمومی)
    [HttpGet]
    public async Task<ActionResult<SiteSettingsResponseDto>> Get(CancellationToken cancellationToken)
    {
        var settings = await _context.SiteSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == 1, cancellationToken);

        settings ??= new SiteSettings
        {
            Id = 1,
            StoreName = "CeramicStore",
            Phone = "",
            Address = "",
            ContentJson = "{}"
        };

        return Ok(SiteSettingsResponseDto.From(settings));
    }

    // PUT: api/settings  (Owner یا ادمینِ دارای مجوز «تنظیمات»)
    [HttpPut]
    [HasPermission(AdminPermissions.Settings)]
    public async Task<ActionResult<SiteSettingsResponseDto>> Update(
        UpdateSettingsDto dto,
        CancellationToken cancellationToken)
    {
        var settings = await _context.SiteSettings
            .FirstOrDefaultAsync(s => s.Id == 1, cancellationToken);

        if (settings is null)
        {
            settings = new SiteSettings { Id = 1, ContentJson = "{}" };
            _context.SiteSettings.Add(settings);
        }

        if (dto.Content is { ValueKind: not JsonValueKind.Undefined and not JsonValueKind.Null } content)
        {
            if (!SiteContent.TryNormalize(content.GetRawText(), out var contentJson, out var error))
            {
                return BadRequest(new { message = error });
            }

            settings.ContentJson = contentJson;
        }

        settings.StoreName = dto.StoreName.Trim();
        settings.Phone = dto.Phone.Trim();
        settings.Address = dto.Address.Trim();
        settings.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
        settings.WorkingHours = string.IsNullOrWhiteSpace(dto.WorkingHours) ? null : dto.WorkingHours.Trim();
        settings.About = string.IsNullOrWhiteSpace(dto.About) ? null : dto.About.Trim();
        settings.Instagram = string.IsNullOrWhiteSpace(dto.Instagram) ? null : dto.Instagram.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(SiteSettingsResponseDto.From(settings));
    }
}
