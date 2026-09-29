import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../../app/hooks';
import type { Product } from '../../core/catalog';
import { availableVariants, resolveSpecs } from '../../core/catalog';
import { ProductImage } from '../../entities/product/ProductImage';
import { ROUTES } from '../../shared/config/routes';
import { useStorefront } from '../../storefront';
import { lineAdded } from '../cart/cartSlice';
import { QuantityPicker } from './QuantityPicker';
import { VariantPicker } from './VariantPicker';

export function ProductDetails({ product }: { product: Product }) {
  const { product: productConfig } = useStorefront();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const hintId = useId();

  const variants = availableVariants(product);
  const selected = variants.find(({ id }) => id === variantId);
  const specs = resolveSpecs(product.attributes, productConfig.specs);

  const addToCart = () => {
    if (!selected) return;
    dispatch(
      lineAdded({
        line: {
          productId: product.id,
          variantId: selected.id,
          variantLabel: selected.label,
          title: product.title,
          price: product.price,
          quantity,
        },
        maxQuantity: productConfig.maxQuantity,
      }),
    );
    void navigate(ROUTES.cart);
  };

  return (
    <section className="catalog-item">
      <h2 className="text-center">{product.title}</h2>
      <div className="row">
        <div className="col-md-5">
          <ProductImage src={product.image} alt={product.title} />
        </div>
        <div className="col-md-7">
          <table className="table table-bordered">
            <tbody>
              {specs.map(({ label, value }) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {variants.length > 0 ? (
            <>
              <div className="text-center">
                <VariantPicker
                  label={productConfig.variantsLabel}
                  variants={variants}
                  selectedId={variantId}
                  onSelect={setVariantId}
                />
                <QuantityPicker
                  value={quantity}
                  max={productConfig.maxQuantity}
                  onChange={setQuantity}
                />
              </div>
              {/*
                Почему кнопка неактивна — не угадывать: подсказка прямо над ней.
                После выбора скрывается через visibility, а не удаляется: место остаётся,
                и кнопка не «прыгает» вверх под курсором.
              */}
              <p
                id={hintId}
                className={`catalog-item-hint text-center small${selected ? ' invisible' : ''}`}
              >
                {productConfig.selectVariantHint}
              </p>
              <button
                type="button"
                className="btn btn-danger btn-block btn-lg"
                disabled={!selected}
                aria-describedby={selected ? undefined : hintId}
                onClick={addToCart}
              >
                В корзину
              </button>
            </>
          ) : (
            // Нет доступных вариантов — ни количества, ни кнопки (требование задания)
            <p className="text-center text-muted">Нет в наличии</p>
          )}
        </div>
      </div>
    </section>
  );
}
