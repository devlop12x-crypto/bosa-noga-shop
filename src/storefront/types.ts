import type { ComponentType } from 'react';

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
  /** Содержимое информационных страниц. Заголовки и маршруты — общие, их задаёт приложение */
  pages: {
    About: ComponentType;
    Contacts: ComponentType;
  };
}
