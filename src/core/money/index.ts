/** Как магазин показывает цены: локаль для разрядов и подпись валюты */
export interface MoneyFormat {
  locale: string;
  currencyLabel: string;
}

/**
 * «34 000 руб.» — как в вёрстке. Intl вместо ручной расстановки пробелов:
 * разделитель разрядов — неразрывный пробел, цена не рвётся на две строки.
 * Между числом и валютой тоже неразрывный пробел.
 */
export const formatPrice = (amount: number, { locale, currencyLabel }: MoneyFormat): string =>
  `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount)}\u00a0${currencyLabel}`;
