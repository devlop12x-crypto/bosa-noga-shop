export { normalizeRuPhone } from './phone';

/** Покупатель в заказе. Нигде не сохраняется — живёт только в форме и в запросе */
export interface OrderOwner {
  phone: string;
  address: string;
}
