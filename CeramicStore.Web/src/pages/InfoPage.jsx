import { Link, Navigate, useParams } from "react-router-dom";
import { useSettings } from "../settings/useSettings.js";
import { mergeSiteContent } from "../settings/siteContent.js";
import "./InfoPage.css";

function InfoPage({ pageKey }) {
  const { slug } = useParams();
  const key = pageKey || slug;
  const { settings } = useSettings();
  const content = mergeSiteContent(settings.content);
  const page = content.legal?.[key];

  if (!page) {
    return <Navigate to="/" replace />;
  }

  const backTo =
    key === "terms" || key === "privacy" || key === "faq" ? "/" : "/#guide";
  const backLabel =
    key === "terms" || key === "privacy" || key === "faq"
      ? "بازگشت به فروشگاه"
      : "بازگشت به راهنمای خرید";

  return (
    <div className="info-page">
      <div className="info-page__inner">
        <Link className="info-page__back" to={backTo}>
          {backLabel}
        </Link>

        <header className="info-page__header">
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </header>

        <ul className="info-page__points">
          {(page.points ?? []).map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        {page.note && (
          <p className="info-page__note" role="note">
            {page.note}
          </p>
        )}
      </div>
    </div>
  );
}

export default InfoPage;
