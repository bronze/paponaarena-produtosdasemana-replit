import type { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function plural(n: number, one: string, many: string) {
  return `${n.toLocaleString("pt-BR")} ${n === 1 ? one : many}`;
}

/** Barra fina com o peso do item em relação ao primeiro do ranking. */
export function ShareBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-highlight" aria-hidden="true">
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, (value / max) * 100)}%` }} />
    </div>
  );
}

export function SortButtons<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (mode: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([mode, label]) => (
        <Button
          key={mode}
          variant={value === mode ? "default" : "outline"}
          size="sm"
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          data-testid={`sort-${mode}`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

/**
 * Linha de ranking: posição, nome com link cobrindo a linha toda, detalhe embaixo e
 * contagem com barra de proporção à direita (no celular a contagem vai em texto).
 * Links dentro do detalhe precisam de `relative z-10` para ficarem clicáveis.
 */
export function RankRow({
  rank,
  title,
  href,
  onClick,
  count,
  max,
  unit = ["menção", "menções"],
  children,
  testId,
}: {
  rank: number;
  title: string;
  href: string;
  onClick?: () => void;
  count: number;
  max: number;
  unit?: [string, string];
  children?: ReactNode;
  testId?: string;
}) {
  const countLabel = plural(count, unit[0], unit[1]);
  return (
    <li
      className="relative grid grid-cols-[3.5rem_1fr] items-start gap-x-3 gap-y-1 border-b px-2 py-5 transition-colors hover:bg-highlight sm:grid-cols-[4.5rem_1fr_8rem] sm:gap-x-6 sm:px-4"
      data-testid={testId}
    >
      <p className="text-2xl font-extrabold leading-tight tracking-[-0.035em] tabular-nums text-muted-foreground sm:text-3xl">{rank}</p>
      <div className="min-w-0 space-y-1">
        <h2 className="text-lg font-bold leading-snug tracking-[-0.01em]">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
            onClick={onClick}
          >
            {title}
          </Link>
        </h2>
        {children}
        <p className="text-sm text-muted-foreground sm:hidden">{countLabel}</p>
      </div>
      <div className="hidden space-y-2 pt-1 sm:block">
        <p className="text-right text-sm text-muted-foreground">{countLabel}</p>
        <ShareBar value={count} max={max} />
      </div>
    </li>
  );
}

/** "Carregar mais N" + "Mostrar todos", para listas longas que abrem em partes. */
export function LoadMore({
  visible,
  total,
  step,
  noun,
  onShow,
}: {
  visible: number;
  total: number;
  step: number;
  noun: { all: string; lastOne: string; lastMany: string };
  onShow: (next: number, mode: "more" | "all") => void;
}) {
  if (total <= visible) return null;
  const remaining = total - visible;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-3">
        {remaining > step ? (
          <>
            <Button variant="outline" className="h-12 rounded-full px-6 font-semibold" onClick={() => onShow(visible + step, "more")} data-testid="button-load-more">
              Carregar mais {step}
            </Button>
            <Button variant="ghost" className="h-12 rounded-full px-6 font-semibold" onClick={() => onShow(total, "all")} data-testid="button-load-all">
              {noun.all} ({total})
            </Button>
          </>
        ) : (
          <Button variant="outline" className="h-12 rounded-full px-6 font-semibold" onClick={() => onShow(total, "all")} data-testid="button-load-all">
            Mostrar {remaining === 1 ? noun.lastOne : `${noun.lastMany} ${remaining}`}
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Mostrando {visible} de {total}
      </p>
    </div>
  );
}

/** Botão no pé de listas de detalhe cortadas em DETAIL_LIST_LIMIT itens. */
export function ShowAllButton({ total, onClick }: { total: number; onClick: () => void }) {
  return (
    <Button variant="outline" className="mt-4 h-12 w-full rounded-full font-semibold" onClick={onClick}>
      Mostrar todos ({total})
    </Button>
  );
}
