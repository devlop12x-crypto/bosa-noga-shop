import { Link } from 'react-router';
import type { ProductSummary } from '../../core/catalog';
import { formatPrice } from '../../core/money';
import { productPath } from '../../shared/config/routes';
import { useStorefront } from '../../storefront';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: ProductSummary;
  /** Доп. класс карточки: в каталоге — catalog-item-card, как в вёрстке */
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const { money } = useStorefront();

  return (
    <div className="col-sm-6 col-lg-4 product-card-col">
      <div className={`card ${className}`.trim()}>
        <ProductImage src={product.image} alt={product.title} className="card-img-top" />
        <div className="card-body">
          <p className="card-text">{product.title}</p>
          <p className="card-text">{formatPrice(product.price, money)}</p>
          <Link to={productPath(product.id)} className="btn btn-outline-primary">
            Заказать
          </Link>
        </div>
      </div>
    </div>
  );
}
