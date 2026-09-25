import { useState } from 'react';
import { useStorefront } from '../../storefront';
import { PRODUCT_IMAGE_PLACEHOLDER } from './placeholder';

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

/**
 * Картинки товаров приходят разных пропорций (от 0.56 до 2.1).
 * Рамка фиксирована aspect-ratio из конфигурации магазина, фото вписывается
 * целиком (object-fit: contain) — карточки в ряду одной высоты, товар не обрезан.
 * Битая ссылка или её отсутствие — заглушка вместо «сломанной» иконки браузера.
 */
export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const { imageAspectRatio } = useStorefront().catalog;
  // Запоминаем, какой именно src упал: при смене товара ошибка сбрасывается сама
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const isBroken = !src || src === failedSrc;

  return (
    <img
      src={isBroken ? PRODUCT_IMAGE_PLACEHOLDER : src}
      alt={alt}
      className={`product-image img-fluid${isBroken ? ' product-image-placeholder' : ''} ${className}`.trim()}
      style={{ aspectRatio: imageAspectRatio }}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
    />
  );
}
