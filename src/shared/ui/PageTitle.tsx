import { useStorefront } from '../../storefront';

/** Заголовок вкладки. React 19 сам поднимает <title> в <head>. */
export function PageTitle({ children }: { children?: string }) {
  const { name } = useStorefront();
  return <title>{children ? `${children} — ${name}` : name}</title>;
}
