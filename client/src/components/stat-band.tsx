import { Link } from "wouter";
import { cn } from "@/lib/utils";

export type StatBandItem = {
  label: string;
  value: number;
  href?: string;
  onClick?: () => void;
};

/** Faixa de números no estilo da Product Arena: números grandes, rótulos em caixa alta e divisórias finas. */
export function StatBand({ items, className }: { items: StatBandItem[]; className?: string }) {
  return (
    <div className={cn("grid gap-px border-y bg-border", className)}>
      {items.map((item) => {
        const content = (
          <>
            <p className="text-4xl font-extrabold leading-none tracking-[-0.035em] md:text-5xl" data-testid={`stat-${item.label.toLowerCase()}`}>
              {item.value.toLocaleString("pt-BR")}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{item.label}</p>
          </>
        );
        return item.href ? (
          <Link
            key={item.label}
            href={item.href}
            className="bg-background px-6 py-6 outline-none ring-inset ring-ring transition-colors hover:bg-highlight focus-visible:ring-2"
            onClick={item.onClick}
          >
            {content}
          </Link>
        ) : (
          <div key={item.label} className="bg-background px-6 py-6">
            {content}
          </div>
        );
      })}
    </div>
  );
}
