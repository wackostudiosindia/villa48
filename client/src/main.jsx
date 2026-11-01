import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted fonts: only the Latin and Gujarati subsets, in the weights the site uses.
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import '@fontsource/noto-sans-gujarati/gujarati-400.css';
import '@fontsource/noto-sans-gujarati/gujarati-500.css';
import '@fontsource/noto-sans-gujarati/gujarati-600.css';
import '@fontsource/noto-sans-gujarati/gujarati-700.css';
import { LangProvider } from './lib/i18n';
import { BookingProvider } from './lib/booking';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LangProvider>
      <BookingProvider>
        <App />
      </BookingProvider>
    </LangProvider>
  </StrictMode>,
);
