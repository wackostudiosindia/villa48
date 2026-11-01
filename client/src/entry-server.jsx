import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import Root from './Root';

/* Used at build time by scripts/prerender.mjs: renders the page to HTML, waiting for lazy sections. */
export async function render() {
  const { prelude } = await prerender(<StrictMode><Root /></StrictMode>);
  return new Response(prelude).text();
}
