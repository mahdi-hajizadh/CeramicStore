using CeramicStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CeramicStore.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();
    public DbSet<StoreImage> StoreImages => Set<StoreImage>();
    public DbSet<OtpChallenge> OtpChallenges => Set<OtpChallenge>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.Phone).IsUnique().HasFilter("\"Phone\" IS NOT NULL");
            entity.Property(u => u.Username).HasMaxLength(30);
            entity.Property(u => u.Role).HasMaxLength(20);
            entity.Property(u => u.PermissionsJson).HasColumnType("text").HasDefaultValue("[]");
            entity.Property(u => u.FullName).HasMaxLength(100);
            entity.Property(u => u.Phone).HasMaxLength(20);
        });

        modelBuilder.Entity<OtpChallenge>(entity =>
        {
            entity.Property(o => o.Phone).HasMaxLength(20);
            entity.Property(o => o.Purpose).HasMaxLength(20);
            entity.Property(o => o.CodeHash).HasMaxLength(500);
            entity.HasIndex(o => new { o.Phone, o.Purpose, o.CreatedAt });
        });

        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasOne<AppUser>()
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(a => a.RecipientName).HasMaxLength(100);
            entity.Property(a => a.Phone).HasMaxLength(20);
            entity.Property(a => a.Province).HasMaxLength(60);
            entity.Property(a => a.City).HasMaxLength(60);
            entity.Property(a => a.AddressLine).HasMaxLength(400);
            entity.Property(a => a.PostalCode).HasMaxLength(10);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(o => o.Items)
                .WithOne()
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(o => o.TotalPrice).HasPrecision(18, 2);
            entity.Property(o => o.RecipientName).HasMaxLength(100);
            entity.Property(o => o.Phone).HasMaxLength(20);
            entity.Property(o => o.Province).HasMaxLength(60);
            entity.Property(o => o.City).HasMaxLength(60);
            entity.Property(o => o.AddressLine).HasMaxLength(400);
            entity.Property(o => o.PostalCode).HasMaxLength(10);
            entity.Property(o => o.Note).HasMaxLength(500);
            entity.HasIndex(o => o.UserId);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(i => i.ProductName).HasMaxLength(150);
            entity.Property(i => i.Brand).HasMaxLength(100);
            entity.Property(i => i.PricePerSquareMeter).HasPrecision(18, 2);
            entity.Property(i => i.BoxCoverage).HasPrecision(18, 2);
        });

        modelBuilder.Entity<SiteSettings>(entity =>
        {
            entity.Property(s => s.StoreName).HasMaxLength(100);
            entity.Property(s => s.Phone).HasMaxLength(30);
            entity.Property(s => s.Address).HasMaxLength(400);
            entity.Property(s => s.Email).HasMaxLength(120);
            entity.Property(s => s.WorkingHours).HasMaxLength(200);
            entity.Property(s => s.About).HasMaxLength(2000);
            entity.Property(s => s.Instagram).HasMaxLength(100);
            entity.Property(s => s.ContentJson)
                .HasColumnType("text")
                .HasDefaultValue("{}");

            entity.HasData(new SiteSettings
            {
                Id = 1,
                StoreName = "CeramicStore",
                Phone = "09917933772",
                Address = "مازندران، آمل",
                WorkingHours = "شنبه تا پنجشنبه، ۹ صبح تا ۸ شب",
                About = "انتخابی مطمئن برای ساختن فضاهای ماندگار.",
                ContentJson = "{}"
            });
        });

        modelBuilder.Entity<StoreImage>(entity =>
        {
            entity.Property(s => s.ImageUrl).HasMaxLength(500);
            entity.Property(s => s.Caption).HasMaxLength(200);
        });
    }
}
