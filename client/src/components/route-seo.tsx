import { useEffect } from "react";
import { useLocation } from "wouter";
import { getPageMeta, SITE_NAME, SITE_URL } from "@/lib/seo";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Atualiza title, description, canonical e og/twitter conforme a rota atual. */
export function RouteSeo() {
  const [location] = useLocation();

  useEffect(() => {
    const meta = getPageMeta(location);
    const url = `${SITE_URL}${meta.canonicalPath === "/" ? "/" : meta.canonicalPath}`;

    document.title = meta.title;
    setCanonical(url);
    setMeta("name", "description", meta.description);
    setMeta("name", "robots", meta.noindex ? "noindex, follow" : "index, follow");

    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:url", url);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
  }, [location]);

  return null;
}
