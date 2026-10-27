using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using CeramicStore.Api.Authorization;
using CeramicStore.Api.Data;
using CeramicStore.Api.Models;
using CeramicStore.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ---------- Database ----------
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection تنظیم نشده است. " +
        "با دستور dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" \"...\" آن را اضافه کن.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ---------- JWT authentication ----------
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
{
    throw new InvalidOperationException(
        "Jwt:Key تنظیم نشده یا کوتاه‌تر از ۳۲ کاراکتر است. " +
        "با دستور dotnet user-secrets set \"Jwt:Key\" \"یک-رشته-تصادفی-حداقل-۳۲-کاراکتری\" آن را اضافه کن.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = "unique_name",
            RoleClaimType = "role"
        };

        options.Events = new JwtBearerEvents
        {
            // اگر کاربر حذف شده یا نقشش عوض شده باشد، توکن قدیمی بی‌اعتبار می‌شود.
            OnTokenValidated = async context =>
            {
                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();

                var idText = context.Principal?.FindFirst("sub")?.Value;
                var role = context.Principal?.FindFirst("role")?.Value;

                if (!int.TryParse(idText, out var userId) ||
                    !await db.Users.AnyAsync(u => u.Id == userId && u.Role == role))
                {
                    context.Fail("توکن دیگر معتبر نیست.");
                }
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    // برای هر بخش پنل مدیریت یک policy ساخته می‌شود (perm:products، perm:orders، ...).
    foreach (var (key, _) in AdminPermissions.All)
    {
        options.AddPolicy(PermissionPolicy.For(key), policy =>
            policy
                .RequireAuthenticatedUser()
                .RequireRole(Roles.Admin, Roles.Owner)
                .AddRequirements(new PermissionRequirement(key)));
    }
});

builder.Services.AddScoped<IAuthorizationHandler, PermissionHandler>();

builder.Services.AddSingleton<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddScoped<ImageStorage>();
builder.Services.AddHttpClient("sms");
builder.Services.AddSingleton<SmsSender>();
builder.Services.AddSingleton<ISmsSender>(sp => sp.GetRequiredService<SmsSender>());
builder.Services.AddScoped<OtpService>();

// ---------- Rate limiting (ورود و ثبت‌نام) ----------
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// ---------- CORS (origins come from appsettings: Cors:AllowedOrigins) ----------
var allowedOrigins =
    builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:5174" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithExposedHeaders("X-Total-Count");
    });
});

// ---------- MVC ----------
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseExceptionHandler();
}

app.UseCors("ReactFrontend");

// Serve uploaded images from wwwroot.
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        // Uploaded file names are random GUIDs, so they can be cached safely.
        context.Context.Response.Headers.CacheControl = "public,max-age=604800";
        context.Context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    }
});

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await SeedData.EnsureOwnerAsync(app.Services);
await SeedData.EnsureProductsAsync(app.Services);

app.Run();
