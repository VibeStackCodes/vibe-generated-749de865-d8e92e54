type AnalyticsEvent = { id: string; event: string; timestamp: number; payload?: unknown };

let events: AnalyticsEvent[] = [];

function loadFromStorage(): void {
  try {
    const raw = localStorage.getItem('tm_analytics_v1');
    if (raw) events = JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    // ignore
  }
}

function saveToStorage(): void {
  try {
    localStorage.setItem('tm_analytics_v1', JSON.stringify(events));
  } catch {
    // ignore
  }
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

loadFromStorage();

export const logEvent = (name: string, payload?: unknown) => {
  const e: AnalyticsEvent = { id: generateId(), event: name, timestamp: Date.now(), payload };
  events.push(e);
  saveToStorage();
};

export const exportAnalyticsAsJson = () => {
  const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tm_analytics.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
