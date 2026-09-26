import type { Category, ProductSummary } from '../core/catalog';
import type { CategoryDto, ItemShortDto } from './dto';

export const toCategory = ({ id, title }: CategoryDto): Category => ({ id, title });

export const toProductSummary = (dto: ItemShortDto): ProductSummary => ({
  id: dto.id,
  categoryId: dto.category,
  title: dto.title,
  price: dto.price,
  image: dto.images[0] ?? null,
});
