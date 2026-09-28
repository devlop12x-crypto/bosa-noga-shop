import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import type { OrderRequestDto } from '../api/dto';
import type { CartLine } from '../core/cart';
import { findItem } from '../test/mocks/fixtures';
import { server } from '../test/mocks/server';
import { renderRoute } from '../test/renderRoute';

const line = (patch: Partial<CartLine> = {}): CartLine => ({
  productId: 100,
  variantId: '7',
  variantLabel: '7',
  title: 'Перчатки мужские №1',
  price: 1000,
  quantity: 2,
  ...patch,
});

const twoLines = [
  line(),
  line({ productId: 200, title: 'Перчатки женские №1', price: 2000, quantity: 1 }),
];

/** Записывает тела POST /api/order */
const recordOrders = () => {
  const orders: OrderRequestDto[] = [];
  server.events.on('request:start', async ({ request }) => {
    if (request.method === 'POST' && request.url.endsWith('/api/order')) {
      orders.push((await request.clone().json()) as OrderRequestDto);
    }
  });
  return orders;
};

const cartTable = () => screen.getByRole('table');
const orderSection = () =>
  screen.getByRole('heading', { name: 'Оформить заказ' }).closest('section')!;

const fillOrderForm = async (
  user: ReturnType<typeof renderRoute>['user'],
  { phone = '8 (912) 345-67-89', address = 'Вологда, ул. Мира, 1', agree = true } = {},
) => {
  const form = orderSection();
  if (phone) await user.type(within(form).getByLabelText('Телефон'), phone);
  if (address) await user.type(within(form).getByLabelText('Адрес доставки'), address);
  if (agree) await user.click(within(form).getByLabelText('Согласен с правилами доставки'));
  await user.click(within(form).getByRole('button', { name: 'Оформить' }));
};

describe('Корзина', () => {
  it('пустая корзина — ни таблицы, ни формы заказа, ни индикатора', async () => {
    renderRoute('/cart.html');
    expect(await screen.findByText(/В корзине пока пусто/)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Оформить заказ' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Корзина' })).toBeInTheDocument();
  });

  it('позиции, подпись варианта из бренда, итоги по зафиксированным ценам', async () => {
    renderRoute('/cart.html', { cart: twoLines });
    const table = await screen.findByRole('table');

    expect(within(table).getByRole('columnheader', { name: 'Размер руки' })).toBeInTheDocument();
    const rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Перчатки мужские №1');
    expect(rows[1]).toHaveTextContent('2 000 ₽');
    expect(rows.at(-1)).toHaveTextContent('Общая стоимость4 000 ₽');
    expect(screen.getByRole('link', { name: 'Корзина, позиций: 2' })).toBeInTheDocument();
  });

  it('удаление убирает позицию из стора и из хранилища', async () => {
    const { user, cartStorage } = renderRoute('/cart.html', { cart: twoLines });
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Удалить «Перчатки мужские №1», 7' }));

    expect(cartStorage.current.map(({ productId }) => productId)).toEqual([200]);
    expect(within(cartTable()).getAllByRole('row').at(-1)).toHaveTextContent('2 000 ₽');
    expect(screen.getByRole('link', { name: 'Корзина, позиций: 1' })).toBeInTheDocument();
  });
});

describe('Оформление заказа', () => {
  it('успех: лоадер, заказ по ценам из корзины, корзина очищена, сообщение', async () => {
    const orders = recordOrders();
    let release: () => void = () => {};
    server.use(
      http.post(
        '*/api/order',
        async () => {
          await new Promise<void>((resolve) => {
            release = resolve;
          });
          return new HttpResponse(null, { status: 204 });
        },
        { once: true },
      ),
    );
    const { user, cartStorage } = renderRoute('/cart.html', { cart: twoLines });
    await screen.findByRole('table');

    await fillOrderForm(user);
    expect(await screen.findByRole('status', { name: 'Оформляем заказ' })).toBeInTheDocument();
    release();

    expect(await screen.findByText('Спасибо! Заказ оформлен.')).toBeInTheDocument();
    expect(orders).toEqual([
      {
        owner: { phone: '+79123456789', address: 'Вологда, ул. Мира, 1' },
        items: [
          { id: 100, price: 1000, count: 2 },
          { id: 200, price: 2000, count: 1 },
        ],
      },
    ]);
    expect(cartStorage.current).toEqual([]);
    expect(screen.queryByRole('heading', { name: 'Оформить заказ' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Корзина' })).toBeInTheDocument();
  });

  it('невалидная форма — подсказки у полей, запрос не уходит', async () => {
    const orders = recordOrders();
    const { user } = renderRoute('/cart.html', { cart: twoLines });
    await screen.findByRole('table');

    await fillOrderForm(user, { phone: '12345', address: '   ', agree: false });

    const form = orderSection();
    expect(within(form).getByLabelText('Телефон')).toHaveAccessibleDescription(
      'Проверьте номер телефона',
    );
    expect(within(form).getByLabelText('Адрес доставки')).toHaveAccessibleDescription(
      'Укажите адрес доставки',
    );
    expect(
      within(form).getByLabelText('Согласен с правилами доставки'),
    ).toHaveAccessibleDescription('Нужно согласие с правилами доставки');
    expect(orders).toHaveLength(0);
  });

  it('цена изменилась — видно было/стало, заказ заблокирован до согласия', async () => {
    const orders = recordOrders();
    // В корзине цена 1000, в магазине уже 1000 + … — берём фикстуру и занижаем цену в корзине
    const current = findItem(100)!.price;
    const { user, cartStorage } = renderRoute('/cart.html', {
      cart: [line({ price: current - 100 })],
    });

    const row = (await screen.findByText(/Цена изменилась/)).closest('tr')!;
    expect(row).toHaveTextContent('было 900 ₽, стало 1 000 ₽');
    const submit = within(orderSection()).getByRole('button', { name: 'Оформить' });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Принять новые цены' }));
    expect(screen.queryByText(/Цена изменилась/)).not.toBeInTheDocument();
    expect(cartStorage.current[0]?.price).toBe(current);
    expect(within(cartTable()).getAllByRole('row').at(-1)).toHaveTextContent('2 000 ₽');

    await fillOrderForm(user);
    await screen.findByText('Спасибо! Заказ оформлен.');
    expect(orders[0]?.items).toEqual([{ id: 100, price: current, count: 2 }]);
  });

  it('цена поменялась прямо перед отправкой — заказ не уходит, покупатель решает', async () => {
    const orders = recordOrders();
    const { user } = renderRoute('/cart.html', { cart: [line()] });
    await screen.findByRole('table');
    // Сверка при открытии прошла; цена меняется, пока покупатель заполняет форму
    await waitFor(() => expect(screen.queryByText(/Цена изменилась/)).not.toBeInTheDocument());
    server.use(
      http.get('*/api/items/:id', () => HttpResponse.json({ ...findItem(100)!, price: 1500 })),
    );

    await fillOrderForm(user);

    expect(await screen.findByText(/было 1 000 ₽, стало 1 500 ₽/)).toBeInTheDocument();
    expect(orders).toHaveLength(0);
  });

  it('размер закончился — позицию нужно удалить, потом заказ проходит', async () => {
    const { user } = renderRoute('/cart.html', {
      cart: [line(), line({ variantId: '8', variantLabel: '8', quantity: 1 })],
    });

    expect(await screen.findByText('Больше нет в наличии — удалите позицию')).toBeInTheDocument();
    expect(within(orderSection()).getByRole('button', { name: 'Оформить' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Удалить «Перчатки мужские №1», 8' }));
    expect(within(orderSection()).getByRole('button', { name: 'Оформить' })).toBeEnabled();

    await fillOrderForm(user);
    expect(await screen.findByText('Спасибо! Заказ оформлен.')).toBeInTheDocument();
  });

  it('товар сняли с продажи (404) — позицию нужно удалить', async () => {
    renderRoute('/cart.html', { cart: [line({ productId: 999, title: 'Старые перчатки' })] });
    expect(await screen.findByText('Товар снят с продажи — удалите позицию')).toBeInTheDocument();
  });

  it('ошибка заказа: без автоповтора, корзина и форма целы, повтор вручную', async () => {
    const orders = recordOrders();
    server.use(
      http.post('*/api/order', () => new HttpResponse(null, { status: 500 }), { once: true }),
    );
    const { user, cartStorage } = renderRoute('/cart.html', { cart: twoLines });
    await screen.findByRole('table');

    await fillOrderForm(user);

    const alert = await within(orderSection()).findByRole('alert');
    expect(alert).toHaveTextContent('Не удалось оформить заказ. Сервер временно недоступен.');
    expect(orders).toHaveLength(1);
    expect(cartStorage.current).toHaveLength(2);
    expect(within(orderSection()).getByLabelText('Телефон')).toHaveValue('8 (912) 345-67-89');

    await user.click(within(orderSection()).getByRole('button', { name: 'Оформить' }));
    expect(await screen.findByText('Спасибо! Заказ оформлен.')).toBeInTheDocument();
    expect(orders).toHaveLength(2);
  });

  it('не удалось проверить цены перед заказом — понятная ошибка, заказ не уходит', async () => {
    const orders = recordOrders();
    const { user } = renderRoute('/cart.html', { cart: twoLines });
    await screen.findByRole('table');
    server.use(http.get('*/api/items/:id', () => HttpResponse.error()));

    await fillOrderForm(user);

    expect(await within(orderSection()).findByRole('alert')).toHaveTextContent(
      'Не удалось проверить актуальные цены. Нет связи с сервером.',
    );
    expect(orders).toHaveLength(0);
  });
});
