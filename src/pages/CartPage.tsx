import { PageTitle } from '../shared/ui/PageTitle';

/** Корзина и оформление заказа подключаются вместе с глобальным состоянием */
export function CartPage() {
  return (
    <section className="cart">
      <PageTitle>Корзина</PageTitle>
      <h2 className="text-center">Корзина</h2>
    </section>
  );
}
