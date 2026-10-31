/* The sky publishes the virtual time of day here so the header clock can show it. */
let state = { clock: '09:00', phase: 0 };
const listeners = new Set();

export const skyStore = {
  get: () => state,
  set(next) {
    if (next.clock === state.clock && next.phase === state.phase) return;
    state = next;
    listeners.forEach((l) => l());
  },
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

/* Fired when page layout changes enough that the thread must be re-measured. */
export const layoutChanged = () => window.dispatchEvent(new Event('v48:layout'));
