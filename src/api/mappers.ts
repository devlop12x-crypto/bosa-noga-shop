import type { OrderItem } from '../core/cart';
import type { Category, Product, ProductSummary } from '../core/catalog';
import type { OrderOwner } from '../core/order';
import type { CategoryDto, ItemFullDto, ItemShortDto, OrderRequestDto } from './dto';

export const toCategory = ({ id, title }: CategoryDto): Category => ({ id, title });

export const toProductSummary = (dto: ItemShortDto): ProductSummary => ({
  id: dto.id,
  categoryId: dto.category,
  title: dto.title,
  price: dto.price,
  image: dto.images[0] ?? null,
});

/**
 * Полная карточка. Размеры бэкенда становятся вариантами (id варианта — сама
 * строка размера, в пределах товара она уникальна). Все остальные строковые
 * поля — атрибуты: какие из них показывать, решает бренд, а не маппер.
 */
export const toProduct = (dto: ItemFullDto): Product => {
  const { id, category, title, images, price, sizes, oldPrice: _oldPrice, ...rest } = dto;

  const attributes = Object.fromEntries(
    Object.entries(rest).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );

  return {
    ...toProductSummary({ id, category, title, images, price }),
    images,
    variants: sizes.map(({ size, available }) => ({ id: size, label: size, available })),
    attributes,
  };
};

export const toOrderRequest = (
  owner: OrderOwner,
  items: readonly OrderItem[],
): OrderRequestDto => ({
  owner: { phone: owner.phone, address: owner.address },
  items: items.map(({ productId, price, quantity }) => ({ id: productId, price, count: quantity })),
});
