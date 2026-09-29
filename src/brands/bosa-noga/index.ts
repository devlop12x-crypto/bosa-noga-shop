import { normalizeRuPhone } from '../../core/order';
import type { StorefrontConfig } from '../../storefront';
import { AboutContent } from './AboutContent';
import banner from './assets/banner.jpg';
import logo from './assets/header-logo.png';
import { ContactsContent } from './ContactsContent';
import { contacts } from './contacts';

/** Bosa Noga — магазин обуви из вёрстки диплома */
export const bosaNoga: StorefrontConfig = {
  id: 'bosa-noga',
  name: 'Bosa Noga',
  description: 'Bosa Noga — модный интернет-магазин обуви и аксессуаров',
  favicon:
    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👟</text></svg>",
  logo: { src: logo, width: 184, height: 59, alt: 'Bosa Noga' },
  banner: {
    src: banner,
    width: 1201,
    height: 357,
    alt: 'К весне готовы!',
    title: 'К весне готовы!',
  },
  contacts,
  money: { locale: 'ru-RU', currencyLabel: 'руб.' },
  catalog: { imageAspectRatio: '3 / 4' },
  product: {
    variantsLabel: 'Размеры в наличии:',
    selectVariantHint: 'Выберите размер, чтобы добавить товар в корзину',
    variantColumnTitle: 'Размер',
    // Ровно те поля, что в вёрстке и задании — «других не нужно»
    specs: [
      { key: 'sku', label: 'Артикул' },
      { key: 'manufacturer', label: 'Производитель' },
      { key: 'color', label: 'Цвет' },
      { key: 'material', label: 'Материалы' },
      { key: 'season', label: 'Сезон' },
      { key: 'reason', label: 'Повод' },
    ],
    maxQuantity: 10,
  },
  order: {
    normalizePhone: normalizeRuPhone,
    phonePlaceholder: 'Ваш телефон',
  },
  footer: {
    copyright:
      '2009-2019 © BosaNoga.ru — модный интернет-магазин обуви и аксессуаров. Все права защищены.',
    note: 'Доставка по всей России!',
    paymentSystems: ['paypal', 'master-card', 'visa', 'yandex', 'webmoney', 'qiwi'],
    socialLinks: ['twitter', 'vk'],
  },
  pages: {
    About: AboutContent,
    Contacts: ContactsContent,
  },
};
