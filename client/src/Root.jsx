import { LangProvider } from './lib/i18n';
import { BookingProvider } from './lib/booking';
import App from './App';

/* The full app with its providers: shared by the browser entry (main.jsx) and the pre-renderer (entry-server.jsx). */
export default function Root() {
  return (
    <LangProvider>
      <BookingProvider>
        <App />
      </BookingProvider>
    </LangProvider>
  );
}
