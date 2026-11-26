import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "wouter";

/**
 * Volta ao topo a cada troca de página. O wouter não faz isso sozinho, então a página
 * nova abria na mesma altura em que a anterior estava rolada.
 * Voltar/avançar do navegador (popstate) fica de fora, para não perder a posição anterior.
 */
export function ScrollToTop() {
  const [location] = useLocation();
  const fromHistory = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useLayoutEffect(() => {
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}
