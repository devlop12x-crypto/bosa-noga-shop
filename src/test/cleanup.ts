/** Что нужно снять после теста: подписки сторов на события window */
const cleanups: (() => void)[] = [];

export const registerCleanup = (cleanup: () => void) => {
  cleanups.push(cleanup);
};

export const runCleanups = () => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
};
