import type { CategoryDto, ItemFullDto, ItemShortDto } from '../../api/dto';

/** Данные тестового магазина перчаток — в форме ответов бэкенда */

export const categoriesFixture: CategoryDto[] = [
  { id: 21, title: 'Мужские' },
  { id: 22, title: 'Женские' },
];

interface ItemFixture extends ItemFullDto {
  color: string;
}

const make = (
  id: number,
  category: number,
  title: string,
  price: number,
  color: string,
): ItemFixture => ({
  id,
  category,
  title,
  price,
  color,
  images: [`https://img.test/${id}.jpg`, `https://img.test/${id}-2.jpg`],
  sku: `SKU-${id}`,
  material: 'Овчина',
  sizes: [
    { size: '7', available: true },
    { size: '8', available: false },
    { size: '9', available: true },
  ],
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

/** Товар, которого нет ни в одном размере */
export const soldOutFixture: ItemFixture = {
  ...make(300, 21, 'Перчатки распроданные', 5000, 'Серый'),
  sizes: [
    { size: '7', available: false },
    { size: '8', available: false },
  ],
};

export const toShort = ({ id, category, title, price, images }: ItemFullDto): ItemShortDto => ({
  id,
  category,
  title,
  price,
  images,
});

export const topSalesFixture: ItemShortDto[] = itemsFixture.slice(0, 3).map(toShort);

export const findItem = (id: number): ItemFixture | undefined =>
  [...itemsFixture, soldOutFixture].find((item) => item.id === id);
