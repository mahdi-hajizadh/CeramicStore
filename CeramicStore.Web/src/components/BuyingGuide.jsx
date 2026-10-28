import { Link } from "react-router-dom";
import { useSettings } from "../settings/useSettings.js";
import {
  IconCalculator,
  IconRotate,
  IconShield,
  IconTruck,
} from "./icons.jsx";
import "./BuyingGuide.css";

const ICONS = {
  shipping: <IconTruck />,
  returns: <IconRotate />,
  authenticity: <IconShield />,
  coverage: <IconCalculator />,
};

const FALLBACK_CARDS = [
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
];

function BuyingGuide() {
  const { settings } = useSettings();
  const guide = settings.content?.buyingGuide;
  const cards = (guide?.cards?.length ? guide.cards : FALLBACK_CARDS).map(
    (card) => ({
      ...card,
      to: `/guide/${card.key}`,
      icon: ICONS[card.key] || <IconTruck />,
    })
  );

  return (
    <section
      className="buying-guide"
      id="guide"
      aria-labelledby="buying-guide-heading"
    >
      <div className="buying-guide__inner">
        <header className="buying-guide__header">
          <h2 id="buying-guide-heading">
            {guide?.heading || "راهنمای خرید از CeramicStore"}
          </h2>
          <p>{guide?.intro || "اطلاعات مهمی که پیش از ثبت سفارش باید بدانید."}</p>
        </header>

        <div className="buying-guide__grid">
          {cards.map((card) => (
            <article className="guide-card" key={card.key}>
              <div className="guide-card__icon" aria-hidden="true">
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.summary}</p>
              <Link className="guide-card__link" to={card.to}>
                جزئیات بیشتر
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BuyingGuide;
