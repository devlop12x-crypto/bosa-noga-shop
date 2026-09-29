import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartLine, CartLineChange, CartLineKey } from '../../core/cart';
import { addLine, applyPriceChanges, positionsCount, removeLine } from '../../core/cart';

export interface CartState {
  lines: CartLine[];
}

const initialState: CartState = { lines: [] };

/**
 * Тонкая обёртка над правилами ядра: вся логика — в core/cart,
 * слайс только связывает её с Redux.
 */
export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    lineAdded(state, action: PayloadAction<{ line: CartLine; maxQuantity: number }>) {
      state.lines = addLine(state.lines, action.payload.line, action.payload.maxQuantity);
    },
    lineRemoved(state, action: PayloadAction<CartLineKey>) {
      state.lines = removeLine(state.lines, action.payload);
    },
    pricesAccepted(state, action: PayloadAction<CartLineChange[]>) {
      state.lines = applyPriceChanges(state.lines, action.payload);
    },
    cleared(state) {
      state.lines = [];
    },
    /** Корзину поменяли в другой вкладке */
    synced(state, action: PayloadAction<CartLine[]>) {
      state.lines = action.payload;
    },
  },
  selectors: {
    selectCartLines: (state) => state.lines,
    selectPositionsCount: (state) => positionsCount(state.lines),
  },
});

export const { lineAdded, lineRemoved, pricesAccepted, cleared, synced } = cartSlice.actions;
export const { selectCartLines, selectPositionsCount } = cartSlice.selectors;
