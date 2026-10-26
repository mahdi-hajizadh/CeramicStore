CeramicStore — راهنمای اجرا

۱) بک‌اند (ASP.NET Core + PostgreSQL)
   cd CeramicStore.Api
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=ceramicstore;Username=...;Password=..."
   dotnet user-secrets set "Jwt:Key" "یک-رشته-تصادفی-حداقل-۳۲-کاراکتری"
   dotnet user-secrets set "Seed:OwnerUsername" "owner"
   dotnet user-secrets set "Seed:OwnerPassword" "یک-رمز-قوی"
   dotnet restore
   dotnet ef migrations add AddShopFeatures
   dotnet ef database update
   dotnet run

   مهم: در پوشه Migrations فقط InitialCreate و AddProductImage هستند و جدول‌های فروشگاه
   (Users، Orders، ...) با دستور migrations add AddShopFeatures ساخته می‌شوند.
   اگر قبلاً migration دیگری برای این جدول‌ها ساخته‌ای و روی دیتابیس اجرا کرده‌ای، قبل از
   ساخت دوباره‌اش در گفتگو بگو تا با هم هماهنگ کنیم. اگر دیتابیس فقط برای آزمایش است،
   ساده‌ترین راه حذف و ساخت دوباره‌اش است: dotnet ef database drop  و بعد  dotnet ef database update

   (Jwt:Key و ConnectionStrings باید قبل از دستورهای dotnet ef تنظیم شده باشند.)
   با اولین اجرا، حساب «صاحب فروشگاه» از Seed:OwnerUsername/OwnerPassword ساخته می‌شود.
   بعد از ساخته‌شدن حساب می‌توانی Seed:OwnerPassword را از secrets پاک کنی.

۲) فرانت‌اند (React + Vite)
   cd CeramicStore.Web
   npm install
   npm run dev

نقش‌ها
  مشتری (Customer): ثبت‌نام در /register، سبد خرید، ثبت سفارش، آدرس‌ها و سفارش‌های من در /account
  ادمین (Admin):    حساب را صاحب فروشگاه می‌سازد و برای هر ادمین بخش‌های مجاز را انتخاب می‌کند:
                      محصولات (/admin)، سفارش‌ها، مشتریان، گزارش فروش، تصاویر فروشگاه، تنظیمات (/owner).
                      دسترسی‌ها در سرور هم بررسی می‌شوند و بلافاصله اعمال می‌شوند.
  صاحب فروشگاه (Owner): به همه بخش‌ها دسترسی دارد و در /owner ادمین‌ها و مجوزهایشان را هم مدیریت می‌کند

نکته‌ها
- آدرس بک‌اند فرانت از .env (VITE_API_URL) و دامنه‌های مجاز CORS از appsettings.json خوانده می‌شود.
- پرداخت آنلاین هنوز وجود ندارد؛ سفارش ثبت می‌شود و فروشگاه با مشتری هماهنگ می‌کند.
