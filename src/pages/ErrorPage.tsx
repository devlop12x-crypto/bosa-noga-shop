import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { ROUTES } from '../shared/config/routes';
import { PageTitle } from '../shared/ui/PageTitle';
import { NotFoundPage } from './NotFoundPage';

/**
 * Ошибка рендера страницы. Висит на беспутевом маршруте внутри MainLayout,
 * поэтому шапка, баннер и футер остаются на месте.
 * Сетевые ошибки сюда не попадают — их показывает каждый виджет сам.
 */
export function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  if (import.meta.env.DEV) console.error(error);

  return (
    <section className="top-sales" role="alert">
      <PageTitle>Ошибка</PageTitle>
      <h2 className="text-center">Что-то пошло не так</h2>
      <p className="text-center">
        Страница не смогла отобразиться. Обновите её или вернитесь на главную.
      </p>
      <p className="text-center">
        <button
          type="button"
          className="btn btn-outline-primary mr-2"
          onClick={() => window.location.reload()}
        >
          Обновить страницу
        </button>
        <Link to={ROUTES.home} className="btn btn-outline-secondary">
          На главную
        </Link>
      </p>
    </section>
  );
}
