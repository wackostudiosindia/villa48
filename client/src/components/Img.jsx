import IMAGES from '../data/images.json';

/*
  Optimised images (see scripts/optimize-images.mjs): photos come as AVIF with a WebP fallback,
  each in several widths, and the browser picks the smallest file that is sharp enough for the screen.
*/
export const srcSet = (name, format = 'webp') => (IMAGES[name][format] || IMAGES[name].webp).map(([u, w]) => `${u} ${w}w`).join(', ');
export const imgUrl = (name, min = 720) => {
  const v = IMAGES[name].webp;
  return (v.find(([, w]) => w >= min) || v[v.length - 1])[0];
};

/* eager: load straight away (above the fold). priority: also jump the queue (only the main hero photo). */
export default function Img({ name, sizes = '100vw', alt = '', eager = false, priority = false, className, style, imgRef, ...rest }) {
  const im = IMAGES[name];
  const img = (
    <img
      ref={imgRef}
      src={imgUrl(name)}
      srcSet={srcSet(name)}
      sizes={sizes}
      width={im.width}
      height={im.height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
      style={style}
      {...rest}
    />
  );
  if (!im.avif) return img;
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(name, 'avif')} sizes={sizes} />
      {img}
    </picture>
  );
}
