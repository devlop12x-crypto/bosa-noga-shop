import { useStorefront } from '../storefront';

/** Рекламный баннер — есть на всех страницах вёрстки */
export function Banner() {
  const { banner } = useStorefront();

  return (
    <div className="banner">
      {/* width/height задают пропорции заранее — без сдвига контента при загрузке картинки */}
      <img
        src={banner.src}
        className="img-fluid"
        alt={banner.alt}
        width={banner.width}
        height={banner.height}
      />
      <h2 className="banner-header">{banner.title}</h2>
    </div>
  );
}
