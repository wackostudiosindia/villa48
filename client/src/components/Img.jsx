import IMAGES from '../data/images.json';

/* Optimised images: WebP in several widths (see scripts/optimize-images.mjs); the browser picks the right one. */
export const srcSet = (name) => IMAGES[name].variants.map(([u, w]) => `${u} ${w}w`).join(', ');
export const imgUrl = (name, min = 800) => {
  const v = IMAGES[name].variants;
  return (v.find(([, w]) => w >= min) || v[v.length - 1])[0];
};

export default function Img({ name, sizes = '100vw', alt = '', eager = false, className, style, imgRef, ...rest }) {
  const im = IMAGES[name];
  return (
    <img
      ref={imgRef}
      src={imgUrl(name)}
      srcSet={srcSet(name)}
      sizes={sizes}
      width={im.width}
      height={im.height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      className={className}
      style={style}
      {...rest}
    />
  );
}
