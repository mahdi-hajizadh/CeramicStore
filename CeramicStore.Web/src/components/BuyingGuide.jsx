import { Link } from "react-router-dom";
import {
  IconCalculator,
  IconRotate,
  IconShield,
  IconTruck,
} from "./icons.jsx";
import "./BuyingGuide.css";

const CARDS = [
  {
    key: "shipping",
    title: "ارسال سفارش",
    summary:
      "روش‌های ارسال، محدوده ارسال، زمان تحویل و هزینه حمل‌ونقل.",
    to: "/guide/shipping",
    icon: <IconTruck />,
  },
  {
    key: "returns",
    title: "شرایط مرجوعی",
    summary:
      "مهلت درخواست، شرایط پذیرش کالا، بسته‌بندی و نحوه رسیدگی به مغایرت سفارش.",
    to: "/guide/returns",
    icon: <IconRotate />,
  },
  {
    key: "authenticity",
    title: "سلامت و اصالت کالا",
    summary:
      "بررسی محصول هنگام تحویل، اعلام شکستگی و تطبیق کالا با سفارش.",
    to: "/guide/authenticity",
    icon: <IconShield />,
  },
  {
    key: "coverage",
    title: "محاسبه متراژ",
    summary:
      "محاسبه متراژ مورد نیاز، پرت برش و تعداد کارتن بر اساس پوشش هر کارتن.",
    to: "/guide/coverage",
    icon: <IconCalculator />,
  },
];

function BuyingGuide() {
  return (
    <section
      className="buying-guide"
      id="guide"
      aria-labelledby="buying-guide-heading"
    >
      <div className="buying-guide__inner">
        <header className="buying-guide__header">
          <h2 id="buying-guide-heading">راهنمای خرید از CeramicStore</h2>
          <p>اطلاعات مهمی که پیش از ثبت سفارش باید بدانید.</p>
        </header>

        <div className="buying-guide__grid">
          {CARDS.map((card) => (
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
