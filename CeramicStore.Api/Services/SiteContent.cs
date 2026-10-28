using System.Text.Json;
using System.Text.Json.Serialization;

namespace CeramicStore.Api.Services;

public static class SiteContent
{
    public const int MaxJsonLength = 100_000;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = false
    };

    public static SiteContentDocument Defaults() => new()
    {
        HeaderTagline = "مرجع تخصصی کاشی و سرامیک",
        Hero = new HeroContent
        {
            Eyebrow = "CERAMIC & TILE COLLECTION",
            TitleLine1 = "زیبایی ماندگار،",
            TitleLine2Prefix = "کیفیت",
            TitleLine2Highlight = "بی‌نظیر",
            Subtitle = "مجموعه‌ای از کاشی و سرامیک باکیفیت برای ساختن فضایی زیباتر و ماندگارتر.",
            PrimaryCta = "مشاهده محصولات",
            SecondaryCta = "تماس با ما"
        },
        Contact = new ContactCopy
        {
            Eyebrow = "CONTACT",
            Heading = "تماس و آدرس فروشگاه",
            Intro = "برای دریافت اطلاعات بیشتر درباره محصولات و سفارش‌ها با ما در ارتباط باشید."
        },
        Footer = new FooterCopy
        {
            Tagline = "انتخابی مطمئن برای ساختن فضاهای ماندگار",
            Description =
                "فروشگاه تخصصی کاشی و سرامیک برای فضاهای داخلی و کاربری‌های متنوع؛ از انتخاب محصول تا آماده‌سازی سفارش در کنار شما هستیم."
        },
        BuyingGuide = new BuyingGuideCopy
        {
            Heading = "راهنمای خرید از CeramicStore",
            Intro = "اطلاعات مهمی که پیش از ثبت سفارش باید بدانید.",
            Cards = new List<GuideCardCopy>
            {
                new()
                {
                    Key = "shipping",
                    Title = "ارسال سفارش",
                    Summary = "روش‌های ارسال، محدوده ارسال، زمان تحویل و هزینه حمل‌ونقل."
                },
                new()
                {
                    Key = "returns",
                    Title = "شرایط مرجوعی",
                    Summary =
                        "مهلت درخواست، شرایط پذیرش کالا، بسته‌بندی و نحوه رسیدگی به مغایرت سفارش."
                },
                new()
                {
                    Key = "authenticity",
                    Title = "سلامت و اصالت کالا",
                    Summary = "بررسی محصول هنگام تحویل، اعلام شکستگی و تطبیق کالا با سفارش."
                },
                new()
                {
                    Key = "coverage",
                    Title = "محاسبه متراژ",
                    Summary =
                        "محاسبه متراژ مورد نیاز، پرت برش و تعداد کارتن بر اساس پوشش هر کارتن."
                }
            }
        },
        Legal = new Dictionary<string, LegalPageCopy>(StringComparer.OrdinalIgnoreCase)
        {
            ["shipping"] = new()
            {
                Title = "ارسال سفارش",
                Intro = "خلاصهٔ موضوع‌هایی که هنگام ارسال سفارش کاشی و سرامیک باید مشخص شوند.",
                Points =
                [
                    "روش‌های ارسال و محدوده پوشش پس از تأیید فروشگاه اعلام می‌شود.",
                    "زمان تقریبی آماده‌سازی و تحویل به نوع محصول، موجودی و مسیر حمل بستگی دارد.",
                    "هزینه حمل‌ونقل بر اساس وزن، حجم و مقصد محاسبه می‌شود."
                ],
                Note = "جزئیات قطعی ارسال باید توسط فروشگاه تأیید شود."
            },
            ["returns"] = new()
            {
                Title = "شرایط مرجوعی",
                Intro = "چارچوب کلی رسیدگی به درخواست مرجوعی یا مغایرت سفارش.",
                Points =
                [
                    "مهلت و شرایط پذیرش مرجوعی مطابق سیاست نهایی فروشگاه است.",
                    "کالای مرجوعی باید در بسته‌بندی مناسب بررسی شود.",
                    "مغایرت سفارش را در اسرع وقت به فروشگاه اعلام کنید."
                ],
                Note = "شرایط دقیق مرجوعی نیازمند تأیید مالک فروشگاه است."
            },
            ["authenticity"] = new()
            {
                Title = "سلامت و اصالت کالا",
                Intro = "نکات پیشنهادی برای بررسی کالا هنگام تحویل.",
                Points =
                [
                    "هنگام تحویل، ظاهر بسته‌ها و تعداد کارتن‌ها را با فاکتور مقایسه کنید.",
                    "در صورت شکستگی، موضوع را همان‌موقع اطلاع دهید.",
                    "تطبیق مدل، رنگ و ابعاد را پیش از نصب بررسی کنید."
                ],
                Note = "رویهٔ رسمی اعلام خسارت باید توسط فروشگاه نهایی شود."
            },
            ["coverage"] = new()
            {
                Title = "محاسبه متراژ",
                Intro = "راهنمای کوتاه برای برآورد متراژ و تعداد کارتن.",
                Points =
                [
                    "متراژ سطح را اندازه‌گیری کنید و پرت برش را در نظر بگیرید.",
                    "تعداد کارتن ≈ متراژ مورد نیاز ÷ پوشش هر کارتن.",
                    "در صفحه هر محصول ابزار محاسبه در دسترس است."
                ],
                Note = "محاسبه نهایی به طرح چیدمان و نظر نصاب بستگی دارد."
            },
            ["terms"] = new()
            {
                Title = "قوانین و مقررات",
                Intro = "چارچوب کلی استفاده از فروشگاه CeramicStore.",
                Points =
                [
                    "استفاده از سایت برای مرور محصولات، ثبت سفارش و مدیریت حساب است.",
                    "اطلاعات سفارش باید صحیح وارد شود.",
                    "قیمت و موجودی ممکن است به‌روز شود."
                ],
                Note = "متن حقوقی نهایی نیازمند تأیید مالک فروشگاه است."
            },
            ["privacy"] = new()
            {
                Title = "حریم خصوصی",
                Intro = "خلاصهٔ رویکرد فروشگاه نسبت به اطلاعات کاربران.",
                Points =
                [
                    "اطلاعات تماس و آدرس برای پردازش سفارش استفاده می‌شود.",
                    "اطلاعات حساب بدون الزام قانونی در اختیار اشخاص ثالث قرار نمی‌گیرد.",
                    "برای اصلاح اطلاعات حساب می‌توانید با فروشگاه تماس بگیرید."
                ],
                Note = "سیاست حریم خصوصی کامل باید توسط فروشگاه تأیید شود."
            },
            ["faq"] = new()
            {
                Title = "سؤالات متداول",
                Intro = "پاسخ‌های کوتاه به پرسش‌های رایج خریداران.",
                Points =
                [
                    "چطور سفارش ثبت کنم؟ محصول را به سبد اضافه کنید و تسویه را کامل کنید.",
                    "هزینه ارسال چقدر است؟ پس از بررسی مقصد اعلام می‌شود.",
                    "اگر کالا آسیب دیده باشد چه کنم؟ هنگام تحویل موضوع را اعلام کنید."
                ],
                Note = "پاسخ‌های عملیاتی باید با رویهٔ واقعی فروشگاه هم‌راستا شود."
            }
        }
    };

    public static SiteContentDocument Parse(string? json)
    {
        if (string.IsNullOrWhiteSpace(json) || json.Trim() == "{}")
        {
            return Defaults();
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<SiteContentDocument>(json, JsonOptions);
            return Merge(Defaults(), parsed);
        }
        catch (JsonException)
        {
            return Defaults();
        }
    }

    public static string Serialize(SiteContentDocument? document) =>
        JsonSerializer.Serialize(Merge(Defaults(), document), JsonOptions);

    public static bool TryNormalize(string? json, out string normalized, out string? error)
    {
        normalized = Serialize(Defaults());
        error = null;

        if (string.IsNullOrWhiteSpace(json))
        {
            return true;
        }

        if (json.Length > MaxJsonLength)
        {
            error = "حجم محتوای سایت بیش از حد مجاز است.";
            return false;
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<SiteContentDocument>(json, JsonOptions);
            normalized = Serialize(parsed);
            return true;
        }
        catch (JsonException)
        {
            error = "فرمت محتوای سایت معتبر نیست.";
            return false;
        }
    }

    public static SiteContentDocument Merge(SiteContentDocument defaults, SiteContentDocument? incoming)
    {
        if (incoming is null) return defaults;

        var result = new SiteContentDocument
        {
            HeaderTagline = Pick(incoming.HeaderTagline, defaults.HeaderTagline),
            Hero = MergeHero(defaults.Hero, incoming.Hero),
            Contact = MergeContact(defaults.Contact, incoming.Contact),
            Footer = MergeFooter(defaults.Footer, incoming.Footer),
            BuyingGuide = MergeGuide(defaults.BuyingGuide, incoming.BuyingGuide),
            Legal = new Dictionary<string, LegalPageCopy>(StringComparer.OrdinalIgnoreCase)
        };

        foreach (var (key, value) in defaults.Legal)
        {
            result.Legal[key] = incoming.Legal != null && incoming.Legal.TryGetValue(key, out var page)
                ? MergeLegal(value, page)
                : CloneLegal(value);
        }

        if (incoming.Legal != null)
        {
            foreach (var (key, value) in incoming.Legal)
            {
                if (!result.Legal.ContainsKey(key))
                {
                    result.Legal[key] = MergeLegal(new LegalPageCopy(), value);
                }
            }
        }

        return result;
    }

    private static HeroContent MergeHero(HeroContent d, HeroContent? i) => new()
    {
        Eyebrow = Pick(i?.Eyebrow, d.Eyebrow),
        TitleLine1 = Pick(i?.TitleLine1, d.TitleLine1),
        TitleLine2Prefix = Pick(i?.TitleLine2Prefix, d.TitleLine2Prefix),
        TitleLine2Highlight = Pick(i?.TitleLine2Highlight, d.TitleLine2Highlight),
        Subtitle = Pick(i?.Subtitle, d.Subtitle),
        PrimaryCta = Pick(i?.PrimaryCta, d.PrimaryCta),
        SecondaryCta = Pick(i?.SecondaryCta, d.SecondaryCta)
    };

    private static ContactCopy MergeContact(ContactCopy d, ContactCopy? i) => new()
    {
        Eyebrow = Pick(i?.Eyebrow, d.Eyebrow),
        Heading = Pick(i?.Heading, d.Heading),
        Intro = Pick(i?.Intro, d.Intro)
    };

    private static FooterCopy MergeFooter(FooterCopy d, FooterCopy? i) => new()
    {
        Tagline = Pick(i?.Tagline, d.Tagline),
        Description = Pick(i?.Description, d.Description)
    };

    private static BuyingGuideCopy MergeGuide(BuyingGuideCopy d, BuyingGuideCopy? i)
    {
        var cards = new List<GuideCardCopy>();
        foreach (var card in d.Cards)
        {
            var match = i?.Cards?.FirstOrDefault(c =>
                string.Equals(c.Key, card.Key, StringComparison.OrdinalIgnoreCase));
            cards.Add(new GuideCardCopy
            {
                Key = card.Key,
                Title = Pick(match?.Title, card.Title),
                Summary = Pick(match?.Summary, card.Summary)
            });
        }

        return new BuyingGuideCopy
        {
            Heading = Pick(i?.Heading, d.Heading),
            Intro = Pick(i?.Intro, d.Intro),
            Cards = cards
        };
    }

    private static LegalPageCopy MergeLegal(LegalPageCopy d, LegalPageCopy? i) => new()
    {
        Title = Pick(i?.Title, d.Title),
        Intro = Pick(i?.Intro, d.Intro),
        Points = i?.Points is { Count: > 0 } ? i.Points.Where(p => !string.IsNullOrWhiteSpace(p)).ToList() : d.Points.ToList(),
        Note = Pick(i?.Note, d.Note)
    };

    private static LegalPageCopy CloneLegal(LegalPageCopy source) => new()
    {
        Title = source.Title,
        Intro = source.Intro,
        Points = source.Points.ToList(),
        Note = source.Note
    };

    private static string Pick(string? value, string fallback) =>
        string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
}

public class SiteContentDocument
{
    public string HeaderTagline { get; set; } = "";
    public HeroContent Hero { get; set; } = new();
    public ContactCopy Contact { get; set; } = new();
    public FooterCopy Footer { get; set; } = new();
    public BuyingGuideCopy BuyingGuide { get; set; } = new();
    public Dictionary<string, LegalPageCopy> Legal { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}

public class HeroContent
{
    public string Eyebrow { get; set; } = "";
    public string TitleLine1 { get; set; } = "";
    public string TitleLine2Prefix { get; set; } = "";
    public string TitleLine2Highlight { get; set; } = "";
    public string Subtitle { get; set; } = "";
    public string PrimaryCta { get; set; } = "";
    public string SecondaryCta { get; set; } = "";
}

public class ContactCopy
{
    public string Eyebrow { get; set; } = "";
    public string Heading { get; set; } = "";
    public string Intro { get; set; } = "";
}

public class FooterCopy
{
    public string Tagline { get; set; } = "";
    public string Description { get; set; } = "";
}

public class BuyingGuideCopy
{
    public string Heading { get; set; } = "";
    public string Intro { get; set; } = "";
    public List<GuideCardCopy> Cards { get; set; } = new();
}

public class GuideCardCopy
{
    public string Key { get; set; } = "";
    public string Title { get; set; } = "";
    public string Summary { get; set; } = "";
}

public class LegalPageCopy
{
    public string Title { get; set; } = "";
    public string Intro { get; set; } = "";
    public List<string> Points { get; set; } = new();
    public string Note { get; set; } = "";
}
