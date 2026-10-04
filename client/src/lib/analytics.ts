type Props = Record<string, unknown>;
type PostHog = typeof import("posthog-js").default;

let client: PostHog | null = null;
const queue: Array<[string, Props | undefined]> = [];

async function load() {
  const { default: posthog } = await import("posthog-js");
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    defaults: "2026-05-30",
    capture_pageview: "history_change",
  });
  client = posthog;
  for (const [event, props] of queue.splice(0)) posthog.capture(event, props);
}

/** Carrega o PostHog depois do load da página, fora do caminho crítico. */
export function initAnalytics() {
  const start = () => {
    if ("requestIdleCallback" in window) requestIdleCallback(() => void load(), { timeout: 3000 });
    else setTimeout(() => void load(), 1500);
  };
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}

export const posthog = {
  capture(event: string, props?: Props) {
    if (client) client.capture(event, props);
    else queue.push([event, props]);
  },
};
