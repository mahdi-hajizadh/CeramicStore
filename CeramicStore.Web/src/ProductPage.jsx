import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "./cart/useCart.js";
import { useProduct } from "./useProduct.js";
import {
  boxesNeeded as calcBoxes,
  formatNumber,
  formatPrice,
  imageSrc,
  parseNumber,
} from "./utils.js";

function ProductPage() {
  const { id } = useParams();
  const { status, product } = useProduct(id);
  const [area, setArea] = useState("");
  const [added, setAdded] = useState("");
  const { addItem, items } = useCart();

  useEffect(() => {
    if (product) document.title = `${product.name} | CeramicStore`;
    return () => {
      document.title = "CeramicStore | فروشگاه کاشی و سرامیک";
    };
  }, [product]);

  const areaValue = parseNumber(area);
  const hasArea = Number.isFinite(areaValue) && areaValue > 0;
  const boxesNeeded =
    hasArea && product ? calcBoxes(areaValue, product.boxCoverage) : 0;
  const totalArea = product ? boxesNeeded * Number(product.boxCoverage) : 0;
  const totalPrice = product ? totalArea * Number(product.pricePerSquareMeter) : 0;
  const exceedsStock = product ? boxesNeeded > product.stock : false;

  const inCart =
    items.find((item) => item.productId === product?.id)?.quantity ?? 0;

  function handleAdd(quantity) {
    addItem(product, quantity);
    setAdded(
      inCart + quantity > product.stock
        ? "تعداد درخواستی بیشتر از موجودی بود؛ سبد روی حداکثر موجودی تنظیم شد."
        : "به سبد خرید اضافه شد."
    );
  }

  return (
    <>
      <section className="product-page">
        <Link className="back-link" to="/#products">
          ← بازگشت به محصولات
        </Link>

        {status === "loading" && (
          <p className="message" role="status">در حال دریافت اطلاعات محصول...</p>
        )}

        {status === "notfound" && (
          <p className="message">این محصول پیدا نشد یا حذف شده است.</p>
        )}

        {status === "error" && (
          <p className="message error" role="alert">
            دریافت اطلاعات محصول ناموفق بود. اتصال بک‌اند را بررسی کن.
          </p>
        )}

        {status === "ready" && product && (
          <div className="product-detail">
            <div className="product-detail-image">
              {product.imageUrl ? (
                <img src={imageSrc(product.imageUrl)} alt={product.name} />
              ) : (
                <div className="product-tile-pattern" />
              )}
            </div>

            <div className="product-detail-info">
              <span className="product-brand">{product.brand}</span>
              <h1>{product.name}</h1>

              <div className="product-detail-price">
                <span className="price-label">قیمت هر متر مربع</span>
                <strong className="price">
                  {formatPrice(product.pricePerSquareMeter)}
                </strong>
              </div>

              <div className="product-details">
                <span>پوشش هر کارتن</span>
                <strong>{formatNumber(product.boxCoverage)} متر مربع</strong>
              </div>

              <div className="product-details">
                <span>موجودی</span>
                <strong>
                  {product.stock > 0
                    ? `${formatNumber(product.stock)} کارتن`
                    : "ناموجود"}
                </strong>
              </div>

              <div className="calculator">
                <h2>محاسبه تعداد کارتن</h2>

                <label>
                  <span>متراژ موردنیاز (متر مربع)</span>
                  <input
                    inputMode="decimal"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    placeholder="مثلاً ۲۵"
                  />
                </label>

                {hasArea && (
                  <div className="calculator-result" role="status">
                    <div className="product-details">
                      <span>تعداد کارتن لازم</span>
                      <strong>{formatNumber(boxesNeeded)} کارتن</strong>
                    </div>
                    <div className="product-details">
                      <span>متراژ نهایی</span>
                      <strong>{formatNumber(totalArea)} متر مربع</strong>
                    </div>
                    <div className="product-details">
                      <span>قیمت تقریبی</span>
                      <strong>{formatPrice(totalPrice)}</strong>
                    </div>

                    {exceedsStock && (
                      <p className="message error">
                        این مقدار بیشتر از موجودی فعلی انبار است.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {product.stock > 0 ? (
                <div className="add-to-cart">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => handleAdd(hasArea ? boxesNeeded : 1)}
                  >
                    {hasArea
                      ? `افزودن ${formatNumber(boxesNeeded)} کارتن به سبد خرید`
                      : "افزودن یک کارتن به سبد خرید"}
                  </button>

                  {inCart > 0 && (
                    <Link className="details-link" to="/cart">
                      {formatNumber(inCart)} کارتن در سبد · مشاهده سبد
                    </Link>
                  )}

                  {added && (
                    <p className="message" role="status">
                      {added}
                    </p>
                  )}
                </div>
              ) : (
                <p className="message error">این محصول فعلاً ناموجود است.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default ProductPage;
