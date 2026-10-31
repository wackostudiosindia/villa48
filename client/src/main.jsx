import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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
