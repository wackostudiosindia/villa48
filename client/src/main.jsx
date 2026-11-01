import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import Root from './Root';
import './styles/index.css';

/*
  The production build pre-renders the whole page into index.html (scripts/prerender.mjs), so visitors see
  it before this script arrives; here React takes over that HTML. In development there's nothing
  pre-rendered, so it renders from scratch.
*/
const container = document.getElementById('root');
const app = <StrictMode><Root /></StrictMode>;
if (container.firstElementChild) hydrateRoot(container, app);
else {
  createRoot(container).render(app);
  window.__v48?.ready(); // dev: styles are injected by script, so lift the intro from here
}
