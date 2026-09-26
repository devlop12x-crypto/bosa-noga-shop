import type { CategoryDto, ItemShortDto } from '../../api/dto';

/** Данные тестового магазина перчаток — в форме ответов бэкенда */

export const categoriesFixture: CategoryDto[] = [
  { id: 21, title: 'Мужские' },
  { id: 22, title: 'Женские' },
];

interface ItemFixture extends ItemShortDto {
  color: string;
}

const make = (id: number, category: number, title: string, price: number, color: string) => ({
  id,
  category,
  title,
  price,
  color,
  images: [`https://img.test/${id}.jpg`],
});

/** 14 товаров: «Все» = 6 + 6 + 2, «Мужские» = 8 (6 + 2), «Женские» = 6 (ровно одна порция) */
export const itemsFixture: ItemFixture[] = [
  ...Array.from({ length: 8 }, (_, i) =>
    make(
      100 + i,
      21,
      `Перчатки мужские №${i + 1}`,
      1000 + i * 100,
      i === 0 ? 'Чёрный' : 'Коричневый',
    ),
  ),
  ...Array.from({ length: 6 }, (_, i) =>
    make(200 + i, 22, `Перчатки женские №${i + 1}`, 2000 + i * 100, 'Красный'),
  ),
];

export const topSalesFixture: ItemShortDto[] = itemsFixture
  .slice(0, 3)
  .map(({ color: _color, ...item }) => item);
