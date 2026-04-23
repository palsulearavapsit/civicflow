// Simple Analytics Utility for Firebase/GA4
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const logEvent = (eventName: string, params?: object) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
  console.log(`[Analytics Event]: ${eventName}`, params);
};

export const TRACKING_EVENTS = {
  ONBOARDING_START: 'onboarding_start',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  CHAT_OPENED: 'chat_opened',
  POLLING_STATION_SEARCH: 'polling_station_search',
  DEADLINE_CLICKED: 'deadline_clicked'
};
