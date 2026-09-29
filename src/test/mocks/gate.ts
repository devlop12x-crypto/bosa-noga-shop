/**
 * «Шлагбаум» для ответа мока: обработчик ждёт gate, тест открывает его release().
 * Нужен, чтобы проверять промежуточные состояния (лоадеры) детерминированно:
 * без него быстрый ответ успевает заменить лоадер данными между find и expect.
 */
export function createGate() {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { gate, release };
}
