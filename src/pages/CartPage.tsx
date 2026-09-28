import { useEffect } from 'react';
import { Link } from 'react-router';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { lineRemoved, pricesAccepted, selectCartLines } from '../features/cart/cartSlice';
import { CartTable } from '../features/cart/CartTable';
import { ChangesNotice } from '../features/checkout/ChangesNotice';
import {
  checkoutReset,
  selectCheckout,
  submitOrder,
  verifyCart,
} from '../features/checkout/checkoutSlice';
import { OrderForm } from '../features/checkout/OrderForm';
import { ROUTES } from '../shared/config/routes';
import { PageTitle } from '../shared/ui/PageTitle';

export function CartPage() {
  const dispatch = useAppDispatch();
  const lines = useAppSelector(selectCartLines);
  const { status, changes, error } = useAppSelector(selectCheckout);
  const isSubmitting = status === 'submitting';

  // При открытии корзины — тихая сверка цен и наличия. Сеть упала — не страшно,
  // перед отправкой заказа сверка всё равно повторится.
  useEffect(() => {
    const verification = dispatch(verifyCart());
    return () => {
      verification.abort();
      dispatch(checkoutReset());
    };
  }, [dispatch]);

  return (
    <>
      <PageTitle>Корзина</PageTitle>
      <section className="cart">
        <h2 className="text-center">Корзина</h2>
        {status === 'success' ? (
          <div className="alert alert-success text-center" role="status">
            <p className="h5">Спасибо! Заказ оформлен.</p>
            <p className="mb-0">
              Мы скоро позвоним, чтобы подтвердить детали.{' '}
              <Link to={ROUTES.catalog}>Вернуться в каталог</Link>
            </p>
          </div>
        ) : lines.length === 0 ? (
          <p className="text-center">
            В корзине пока пусто. <Link to={ROUTES.catalog}>Перейти в каталог</Link>
          </p>
        ) : (
          <>
            <CartTable
              lines={lines}
              changes={changes}
              disabled={isSubmitting}
              onRemove={(key) => dispatch(lineRemoved(key))}
            />
            {changes.length > 0 && (
              <ChangesNotice
                changes={changes}
                onAcceptPrices={() => dispatch(pricesAccepted(changes))}
              />
            )}
          </>
        )}
      </section>

      {status !== 'success' && lines.length > 0 && (
        <section className="order">
          <h2 className="text-center">Оформить заказ</h2>
          <OrderForm
            isSubmitting={isSubmitting}
            isBlocked={changes.length > 0}
            error={status === 'failed' ? error : null}
            onSubmit={(owner) => void dispatch(submitOrder(owner))}
          />
        </section>
      )}
    </>
  );
}
