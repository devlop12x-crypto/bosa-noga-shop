import { Outlet, ScrollRestoration } from 'react-router';
import { Banner } from './Banner';
import { Footer } from './Footer';
import { Header } from './Header';

export function MainLayout() {
  return (
    <>
      <Header />
      <main className="container">
        <div className="row">
          <div className="col">
            <Banner />
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
