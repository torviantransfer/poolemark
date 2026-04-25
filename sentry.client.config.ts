// Sentry client init lazy-loaded to reduce initial JS bundle.
// We only load @sentry/nextjs after the page becomes interactive
// and only in production with a configured DSN.
if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_SENTRY_DSN
) {
  const start = () => {
    import("@sentry/nextjs").then((Sentry) => {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: 0.2,
      });
    });
  };

  if ("requestIdleCallback" in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(start);
  } else {
    setTimeout(start, 2000);
  }
}

export {};
