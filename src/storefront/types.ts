import type { ComponentType } from 'react';
import type { SpecDefinition } from '../core/catalog';
import type { MoneyFormat } from '../core/money';

/**
 * Контракт «бренда» — всё, чем один магазин отличается от другого.
 * Код приложения знает только этот интерфейс: чтобы сделать из магазина
 * обуви магазин перчаток, пишется новый пакет в src/brands/, а не правятся компоненты.
 */

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** Спрайты footer-pay-systems-* из темы вёрстки */
export type PaymentSystem = 'paypal' | 'master-card' | 'visa' | 'yandex' | 'webmoney' | 'qiwi';

/** Спрайты footer-social-link-* из темы вёрстки */
export type SocialNetwork = 'twitter' | 'vk';

export interface StorefrontConfig {
  /** Машинный идентификатор: префикс ключей localStorage, чтобы магазины на одном домене не делили корзину */
  id: string;
  /** Название магазина: заголовки вкладок */
  name: string;
  /** Текст для <meta name="description"> */
  description: string;
  /** Favicon: URL или data-URI */
  favicon: string;
  logo: ImageAsset;
  banner: ImageAsset & { title: string };
  contacts: {
    phone: { display: string; href: string };
    email: string;
    workingHours: string;
  };
  footer: {
    copyright: string;
    note: string;
    paymentSystems: readonly PaymentSystem[];
    socialLinks: readonly SocialNetwork[];
  };
  /** Формат цен */
  money: MoneyFormat;
  catalog: {
    /**
     * Пропорции картинки в карточке (CSS aspect-ratio). Фото товаров приходят
     * разных размеров, рамка одинаковая: у обуви 3 / 4, у перчаток может быть 1 / 1.
     */
    imageAspectRatio: string;
  };
  product: {
    /** Подпись над вариантами на странице товара: «Размеры в наличии:» */
    variantsLabel: string;
    /** Подсказка, пока вариант не выбран: «Выберите размер» (у сумки было бы «Выберите цвет») */
    selectVariantHint: string;
    /** Заголовок колонки варианта в корзине: «Размер» */
    variantColumnTitle: string;
    /** Строки таблицы характеристик: какие атрибуты показывать и как их подписать */
    specs: readonly SpecDefinition[];
    /** Максимум единиц в одной позиции */
    maxQuantity: number;
  };
  order: {
    /** Приводит телефон к формату для заказа; null — номер не распознан */
    normalizePhone: (raw: string) => string | null;
    phonePlaceholder: string;
  };
  /** Содержимое информационных страниц. Заголовки и маршруты — общие, их задаёт приложение */
  pages: {
    About: ComponentType;
    Contacts: ComponentType;
  };
}
