/*
  Build step: renders the React app to static HTML and puts it inside <div id="root"> in dist/index.html,
  so the page content arrives with the HTML (fast first paint, works before JavaScript loads).
  The browser then "hydrates" it: React attaches to the existing HTML instead of building it again.
*/
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ssrDir = path.resolve('dist-ssr');
const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
const html = await render();
const file = path.resolve('dist/index.html');
const page = await readFile(file, 'utf8');
if (!page.includes('<!--app-html-->')) throw new Error('dist/index.html has no <!--app-html--> placeholder');
await writeFile(file, page.replace('<!--app-html-->', html));
await rm(ssrDir, { recursive: true, force: true });
console.log(`prerendered ${Math.round(html.length / 1024)} KB of HTML into dist/index.html`);
