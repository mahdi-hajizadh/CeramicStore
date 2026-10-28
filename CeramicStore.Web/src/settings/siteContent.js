export const GUIDE_CARD_KEYS = ["shipping", "returns", "authenticity", "coverage"];

export const LEGAL_PAGE_KEYS = [
  "shipping",
  "returns",
  "authenticity",
  "coverage",
  "terms",
  "privacy",
  "faq",
];

export const LEGAL_PAGE_LABELS = {
  shipping: "ارسال سفارش",
  returns: "شرایط مرجوعی",
  authenticity: "سلامت و اصالت کالا",
  coverage: "محاسبه متراژ",
  terms: "قوانین و مقررات",
  privacy: "حریم خصوصی",
  faq: "سؤالات متداول",
};

export function defaultSiteContent() {
  return {
    headerTagline: "مرجع تخصصی کاشی و سرامیک",
    hero: {
      eyebrow: "CERAMIC & TILE COLLECTION",
      titleLine1: "زیبایی ماندگار،",
      titleLine2Prefix: "کیفیت",
      titleLine2Highlight: "بی‌نظیر",
      subtitle:
        "مجموعه‌ای از کاشی و سرامیک باکیفیت برای ساختن فضایی زیباتر و ماندگارتر.",
      primaryCta: "مشاهده محصولات",
      secondaryCta: "تماس با ما",
    },
    contact: {
      eyebrow: "CONTACT",
      heading: "تماس و آدرس فروشگاه",
      intro:
        "برای دریافت اطلاعات بیشتر درباره محصولات و سفارش‌ها با ما در ارتباط باشید.",
    },
    footer: {
      tagline: "انتخابی مطمئن برای ساختن فضاهای ماندگار",
      description:
        "فروشگاه تخصصی کاشی و سرامیک برای فضاهای داخلی و کاربری‌های متنوع؛ از انتخاب محصول تا آماده‌سازی سفارش در کنار شما هستیم.",
    },
    buyingGuide: {
      heading: "راهنمای خرید از CeramicStore",
      intro: "اطلاعات مهمی که پیش از ثبت سفارش باید بدانید.",
      cards: [
        {
          key: "shipping",
          title: "ارسال سفارش",
          summary: "روش‌های ارسال، محدوده ارسال، زمان تحویل و هزینه حمل‌ونقل.",
        },
        {
          key: "returns",
          title: "شرایط مرجوعی",
          summary:
            "مهلت درخواست، شرایط پذیرش کالا، بسته‌بندی و نحوه رسیدگی به مغایرت سفارش.",
        },
        {
          key: "authenticity",
          title: "سلامت و اصالت کالا",
          summary: "بررسی محصول هنگام تحویل، اعلام شکستگی و تطبیق کالا با سفارش.",
        },
        {
          key: "coverage",
          title: "محاسبه متراژ",
          summary:
            "محاسبه متراژ مورد نیاز، پرت برش و تعداد کارتن بر اساس پوشش هر کارتن.",
        },
      ],
    },
    legal: {
      shipping: {
        title: "ارسال سفارش",
        intro: "خلاصهٔ موضوع‌هایی که هنگام ارسال سفارش کاشی و سرامیک باید مشخص شوند.",
        points: [
          "روش‌های ارسال و محدوده پوشش پس از تأیید فروشگاه اعلام می‌شود.",
          "زمان تقریبی آماده‌سازی و تحویل به نوع محصول، موجودی و مسیر حمل بستگی دارد.",
          "هزینه حمل‌ونقل بر اساس وزن، حجم و مقصد محاسبه می‌شود.",
        ],
        note: "جزئیات قطعی ارسال باید توسط فروشگاه تأیید شود.",
      },
      returns: {
        title: "شرایط مرجوعی",
        intro: "چارچوب کلی رسیدگی به درخواست مرجوعی یا مغایرت سفارش.",
        points: [
          "مهلت و شرایط پذیرش مرجوعی مطابق سیاست نهایی فروشگاه است.",
          "کالای مرجوعی باید در بسته‌بندی مناسب بررسی شود.",
          "مغایرت سفارش را در اسرع وقت به فروشگاه اعلام کنید.",
        ],
        note: "شرایط دقیق مرجوعی نیازمند تأیید مالک فروشگاه است.",
      },
      authenticity: {
        title: "سلامت و اصالت کالا",
        intro: "نکات پیشنهادی برای بررسی کالا هنگام تحویل.",
        points: [
          "هنگام تحویل، ظاهر بسته‌ها و تعداد کارتن‌ها را با فاکتور مقایسه کنید.",
          "در صورت شکستگی، موضوع را همان‌موقع اطلاع دهید.",
          "تطبیق مدل، رنگ و ابعاد را پیش از نصب بررسی کنید.",
        ],
        note: "رویهٔ رسمی اعلام خسارت باید توسط فروشگاه نهایی شود.",
      },
      coverage: {
        title: "محاسبه متراژ",
        intro: "راهنمای کوتاه برای برآورد متراژ و تعداد کارتن.",
        points: [
          "متراژ سطح را اندازه‌گیری کنید و پرت برش را در نظر بگیرید.",
          "تعداد کارتن ≈ متراژ مورد نیاز ÷ پوشش هر کارتن.",
          "در صفحه هر محصول ابزار محاسبه در دسترس است.",
        ],
        note: "محاسبه نهایی به طرح چیدمان و نظر نصاب بستگی دارد.",
      },
      terms: {
        title: "قوانین و مقررات",
        intro: "چارچوب کلی استفاده از فروشگاه CeramicStore.",
        points: [
          "استفاده از سایت برای مرور محصولات، ثبت سفارش و مدیریت حساب است.",
          "اطلاعات سفارش باید صحیح وارد شود.",
          "قیمت و موجودی ممکن است به‌روز شود.",
        ],
        note: "متن حقوقی نهایی نیازمند تأیید مالک فروشگاه است.",
      },
      privacy: {
        title: "حریم خصوصی",
        intro: "خلاصهٔ رویکرد فروشگاه نسبت به اطلاعات کاربران.",
        points: [
          "اطلاعات تماس و آدرس برای پردازش سفارش استفاده می‌شود.",
          "اطلاعات حساب بدون الزام قانونی در اختیار اشخاص ثالث قرار نمی‌گیرد.",
          "برای اصلاح اطلاعات حساب می‌توانید با فروشگاه تماس بگیرید.",
        ],
        note: "سیاست حریم خصوصی کامل باید توسط فروشگاه تأیید شود.",
      },
      faq: {
        title: "سؤالات متداول",
        intro: "پاسخ‌های کوتاه به پرسش‌های رایج خریداران.",
        points: [
          "چطور سفارش ثبت کنم؟ محصول را به سبد اضافه کنید و تسویه را کامل کنید.",
          "هزینه ارسال چقدر است؟ پس از بررسی مقصد اعلام می‌شود.",
          "اگر کالا آسیب دیده باشد چه کنم؟ هنگام تحویل موضوع را اعلام کنید.",
        ],
        note: "پاسخ‌های عملیاتی باید با رویهٔ واقعی فروشگاه هم‌راستا شود.",
      },
    },
  };
}

function pick(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function mergeSiteContent(incoming) {
  const defaults = defaultSiteContent();
  if (!incoming || typeof incoming !== "object") return defaults;

  const cards = GUIDE_CARD_KEYS.map((key) => {
    const fallback = defaults.buyingGuide.cards.find((c) => c.key === key);
    const match = Array.isArray(incoming.buyingGuide?.cards)
      ? incoming.buyingGuide.cards.find((c) => c.key === key)
      : null;
    return {
      key,
      title: pick(match?.title, fallback.title),
      summary: pick(match?.summary, fallback.summary),
    };
  });

  const legal = {};
  for (const key of LEGAL_PAGE_KEYS) {
    const fallback = defaults.legal[key];
    const page = incoming.legal?.[key] ?? {};
    const points = Array.isArray(page.points)
      ? page.points.map((p) => String(p ?? "").trim()).filter(Boolean)
      : fallback.points;
    legal[key] = {
      title: pick(page.title, fallback.title),
      intro: pick(page.intro, fallback.intro),
      points: points.length ? points : fallback.points,
      note: pick(page.note, fallback.note),
    };
  }

  return {
    headerTagline: pick(incoming.headerTagline, defaults.headerTagline),
    hero: {
      eyebrow: pick(incoming.hero?.eyebrow, defaults.hero.eyebrow),
      titleLine1: pick(incoming.hero?.titleLine1, defaults.hero.titleLine1),
      titleLine2Prefix: pick(
        incoming.hero?.titleLine2Prefix,
        defaults.hero.titleLine2Prefix
      ),
      titleLine2Highlight: pick(
        incoming.hero?.titleLine2Highlight,
        defaults.hero.titleLine2Highlight
      ),
      subtitle: pick(incoming.hero?.subtitle, defaults.hero.subtitle),
      primaryCta: pick(incoming.hero?.primaryCta, defaults.hero.primaryCta),
      secondaryCta: pick(incoming.hero?.secondaryCta, defaults.hero.secondaryCta),
    },
    contact: {
      eyebrow: pick(incoming.contact?.eyebrow, defaults.contact.eyebrow),
      heading: pick(incoming.contact?.heading, defaults.contact.heading),
      intro: pick(incoming.contact?.intro, defaults.contact.intro),
    },
    footer: {
      tagline: pick(incoming.footer?.tagline, defaults.footer.tagline),
      description: pick(incoming.footer?.description, defaults.footer.description),
    },
    buyingGuide: {
      heading: pick(incoming.buyingGuide?.heading, defaults.buyingGuide.heading),
      intro: pick(incoming.buyingGuide?.intro, defaults.buyingGuide.intro),
      cards,
    },
    legal,
  };
}
