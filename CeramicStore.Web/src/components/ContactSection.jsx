import { useSettings } from "../settings/useSettings.js";
import { instagramUrl, toTelHref } from "../utils.js";
import {
  IconClock,
  IconInstagram,
  IconMail,
  IconPhone,
  IconPin,
} from "./icons.jsx";
import "./ContactSection.css";

const FALLBACKS = {
  address: "مازندران، آمل",
  phone: "09917933772",
  email: "mahdi5758hajizadh@gmail.com",
  workingHours: "شنبه تا پنجشنبه، ۹ صبح تا ۸ شب",
  instagram: "madi.hajizadh",
};

function ContactSection() {
  const { settings } = useSettings();

  const address = settings.address || FALLBACKS.address;
  const phone = settings.phone || FALLBACKS.phone;
  const email = settings.email || FALLBACKS.email;
  const workingHours = settings.workingHours || FALLBACKS.workingHours;
  const instagram = settings.instagram || FALLBACKS.instagram;
  const igHref = instagramUrl(instagram);

  const items = [
    {
      key: "address",
      label: "آدرس",
      icon: <IconPin />,
      content: <span>{address}</span>,
    },
    {
      key: "phone",
      label: "تلفن",
      icon: <IconPhone />,
      content: (
        <a href={toTelHref(phone)} dir="ltr">
          {phone}
        </a>
      ),
    },
    {
      key: "email",
      label: "ایمیل",
      icon: <IconMail />,
      content: (
        <a href={`mailto:${email}`} dir="ltr" className="contact-cell__email">
          {email}
        </a>
      ),
    },
    {
      key: "hours",
      label: "ساعات کاری",
      icon: <IconClock />,
      content: <span>{workingHours}</span>,
    },
  ];

  return (
    <section className="contact-section" id="about" aria-labelledby="contact-heading">
      <div className="contact-section__inner">
        <header className="contact-section__header">
          <span className="contact-section__eyebrow">CONTACT</span>
          <h2 id="contact-heading">تماس و آدرس فروشگاه</h2>
          <p>
            برای دریافت اطلاعات بیشتر درباره محصولات و سفارش‌ها با ما در ارتباط
            باشید.
          </p>
        </header>

        <div className="contact-grid">
          {items.map((item) => (
            <article className="contact-cell" key={item.key}>
              <div className="contact-cell__icon" aria-hidden="true">
                {item.icon}
              </div>
              <div className="contact-cell__body">
                <h3>{item.label}</h3>
                <div className="contact-cell__value">{item.content}</div>
              </div>
            </article>
          ))}
        </div>

        {igHref && (
          <div className="contact-social">
            <a
              href={igHref}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-social__link"
            >
              <IconInstagram />
              <span>
                اینستاگرام
                <strong dir="ltr">{instagram.replace(/^@/, "")}</strong>
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default ContactSection;
