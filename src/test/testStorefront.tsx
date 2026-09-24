import type { StorefrontConfig } from '../storefront';

/**
 * Нарочно «чужой» магазин — перчатки. Тесты приложения идут на нём,
 * поэтому любая обувная строка, зашитая в компоненты, сразу всплывёт.
 */
export const glovesStorefront: StorefrontConfig = {
  name: 'Перчатки & Ко',
  description: 'Кожаные перчатки ручной работы',
  favicon: 'data:,',
  logo: { src: '/test/logo.png', width: 120, height: 40, alt: 'Перчатки & Ко' },
  banner: {
    src: '/test/banner.jpg',
    width: 1200,
    height: 360,
    alt: 'Осенняя коллекция',
    title: 'Тепло рукам!',
  },
  contacts: {
    phone: { display: '+7 800 000-00-00', href: 'tel:+78000000000' },
    email: 'hello@gloves.test',
    workingHours: 'По будням: с 10-00 до 19-00',
  },
  footer: {
    copyright: '© Перчатки & Ко',
    note: 'Доставка по Вологде',
    paymentSystems: ['visa', 'master-card'],
    socialLinks: ['vk'],
  },
  pages: {
    About: () => <p>Шьём перчатки с 1998 года.</p>,
    Contacts: () => <p>Мастерская в центре города.</p>,
  },
};
