import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { describeRequestError, isNotFoundError } from '../../api/errors';
import { shopApi } from '../../api/shopApi';
import type { AppDispatch, RootState } from '../../app/store';
import type { CartLineChange } from '../../core/cart';
import { reconcileCart, toOrderItems, uniqueProductIds } from '../../core/cart';
import type { Product, ProductId } from '../../core/catalog';
import type { OrderOwner } from '../../core/order';
import {
  cleared,
  lineAdded,
  lineRemoved,
  pricesAccepted,
  selectCartLines,
  synced,
} from '../cart/cartSlice';

const createAppThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
}>();

/**
 * Свежие карточки всех товаров корзины, в обход кэша.
 * 404 — товар снят с продажи (null), любая другая ошибка — проверить не удалось.
 */
async function fetchFreshProducts(
  ids: readonly ProductId[],
  dispatch: AppDispatch,
): Promise<Map<ProductId, Product | null>> {
  const entries = await Promise.all(
    ids.map(async (id) => {
      const result = await dispatch(
        shopApi.endpoints.getProduct.initiate(id, { forceRefetch: true, subscribe: false }),
      );
      // Сначала статус, а не data: при ошибке RTK оставляет в data прошлый успешный ответ,
      // и устаревшая цена выдала бы себя за свежую
      if (result.isSuccess) return [id, result.data] as const;
      if (isNotFoundError(result.error)) return [id, null] as const;
      throw result.error;
    }),
  );
  return new Map(entries);
}

/** Сверка корзины с актуальными ценами и наличием — без отправки заказа */
export const verifyCart = createAppThunk(
  'checkout/verify',
  async (_: void, { getState, dispatch }) => {
    const lines = selectCartLines(getState());
    const fresh = await fetchFreshProducts(uniqueProductIds(lines), dispatch);
    return reconcileCart(lines, fresh);
  },
);

export type SubmitOutcome =
  { outcome: 'ordered' } | { outcome: 'changes'; changes: CartLineChange[] };

/**
 * Оформление заказа — ядро оркестрирует, thunk связывает с сетью:
 * 1) свежие карточки товаров; 2) сверка корзины (core/reconcileCart);
 * 3) есть расхождения — заказ не отправляется, покупатель решает сам;
 * 4) нет — POST /api/order по ценам из корзины, затем корзина очищается.
 */
export const submitOrder = createAppThunk(
  'checkout/submit',
  async (owner: OrderOwner, { getState, dispatch, rejectWithValue }): Promise<SubmitOutcome> => {
    const lines = selectCartLines(getState());

    let fresh: Map<ProductId, Product | null>;
    try {
      fresh = await fetchFreshProducts(uniqueProductIds(lines), dispatch);
    } catch (error) {
      throw rejectWithValue(
        `Не удалось проверить актуальные цены. ${describeRequestError(error as FetchBaseQueryError)}`,
      );
    }

    const changes = reconcileCart(lines, fresh);
    if (changes.length > 0) return { outcome: 'changes', changes };

    try {
      await dispatch(
        shopApi.endpoints.createOrder.initiate({ owner, items: toOrderItems(lines) }),
      ).unwrap();
    } catch (error) {
      throw rejectWithValue(
        `Не удалось оформить заказ. ${describeRequestError(error as FetchBaseQueryError)}`,
      );
    }

    dispatch(cleared());
    return { outcome: 'ordered' };
  },
);

export type CheckoutStatus = 'idle' | 'submitting' | 'success' | 'failed';

export interface CheckoutState {
  status: CheckoutStatus;
  /** Расхождения корзины с магазином: пока они есть, заказ не отправляется */
  changes: CartLineChange[];
  error: string | null;
}

const initialState: CheckoutState = { status: 'idle', changes: [], error: null };

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    /** Ушли со страницы корзины — сообщения об успехе и ошибке больше не актуальны */
    checkoutReset: (state) => ({ ...initialState, changes: state.changes }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyCart.fulfilled, (state, action) => {
        state.changes = action.payload;
      })
      .addCase(submitOrder.pending, (state) => {
        state.status = 'submitting';
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        if (action.payload.outcome === 'ordered') {
          state.status = 'success';
          state.changes = [];
        } else {
          state.status = 'idle';
          state.changes = action.payload.changes;
        }
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Не удалось оформить заказ.';
      })
      // Расхождение исчезает вместе с причиной
      .addCase(lineRemoved, (state, action) => {
        state.changes = state.changes.filter((change) => change.key !== action.payload);
      })
      .addCase(pricesAccepted, (state) => {
        state.changes = state.changes.filter((change) => change.kind !== 'price');
      })
      .addCase(lineAdded, (state, action) => {
        // Повторное добавление приносит актуальную цену — старое расхождение по цене снято
        const { productId, variantId } = action.payload.line;
        const key = `${productId}:${variantId}`;
        state.changes = state.changes.filter(
          (change) => !(change.key === key && change.kind === 'price'),
        );
        // Новая покупка — прошлый «Заказ оформлен» больше не про эту корзину
        if (state.status === 'success') state.status = 'idle';
      })
      .addCase(cleared, (state) => {
        state.changes = [];
      })
      .addCase(synced, (state) => {
        state.changes = [];
      });
  },
  selectors: {
    selectCheckout: (state) => state,
  },
});

export const { checkoutReset } = checkoutSlice.actions;
export const { selectCheckout } = checkoutSlice.selectors;
