import { Link, useParams } from "wouter";
import { ArrowLeft, Search } from "lucide-react";
import { posthog } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatBand } from "@/components/stat-band";
import { useState, useMemo } from "react";
import { normalize } from "@/lib/text";
import { categoryLabel } from "@/lib/categories";
import { getCategoryStats, getProductsForCategory, getMentionsForProduct } from "@/lib/data-utils";

const MAX_LIST_PRODUCTS = 3;

function plural(n: number, one: string, many: string) {
  return `${n.toLocaleString("pt-BR")} ${n === 1 ? one : many}`;
}

/** Barra fina com o peso do item em relação ao primeiro do ranking. */
function ShareBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-highlight" aria-hidden="true">
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, (value / max) * 100)}%` }} />
    </div>
  );
}

function SortButtons<T extends string>({ options, value, onChange }: { options: readonly (readonly [T, string])[]; value: T; onChange: (mode: T) => void }) {
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

type SortMode = "mentions" | "alpha";

function buildCategoryRows() {
  return getCategoryStats().map((cat, i) => {
    const products = getProductsForCategory(cat.category);
    return {
      ...cat,
      rank: i + 1,
      products,
      searchText: normalize([cat.category, categoryLabel(cat.category), ...products.map((p) => p.name)].join(" ")),
    };
  });
}

type CategoryRowData = ReturnType<typeof buildCategoryRows>[number];

function CategoryRow({ row, max, query }: { row: CategoryRowData; max: number; query: string }) {
  // Na busca por produto, os produtos que batem aparecem primeiro
  const ordered = query
    ? [...row.products].sort((a, b) => Number(normalize(b.name).includes(query)) - Number(normalize(a.name).includes(query)))
    : row.products;
  const shown = ordered.slice(0, MAX_LIST_PRODUCTS);
  const rest = row.products.length - shown.length;
  return (
    <li
      className="relative grid grid-cols-[2rem_1fr] items-start gap-x-3 gap-y-1 border-b px-2 py-4 transition-colors hover:bg-highlight sm:grid-cols-[2.5rem_1fr_8rem] sm:gap-x-4 sm:px-4"
      data-testid={`card-category-${row.category}`}
    >
      <span className="pt-0.5 text-right text-sm font-bold tabular-nums text-muted-foreground">{row.rank}</span>
      <div className="min-w-0 space-y-1">
        <h2 className="text-lg font-bold leading-snug tracking-[-0.01em]">
          <Link
            href={`/categories/${encodeURIComponent(row.category)}`}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
            onClick={() => posthog.capture("category_viewed", { category: row.category, mention_count: row.count })}
          >
            {categoryLabel(row.category)}
          </Link>
        </h2>
        <p className="text-sm" data-testid={`text-products-${row.category}`}>
          <span className="text-muted-foreground">{plural(row.products.length, "produto", "produtos")}: </span>
          {shown.map((product, i) => (
            <span key={product.id}>
              {i > 0 && <span className="text-muted-foreground" aria-hidden="true"> · </span>}
              <Link href={`/products/${product.id}`} className="relative z-10 font-semibold underline-offset-2 hover:underline">
                {product.name}
              </Link>
            </span>
          ))}
          {rest > 0 && <span className="text-muted-foreground"> · +{rest}</span>}
        </p>
        <p className="text-sm text-muted-foreground sm:hidden">{plural(row.count, "menção", "menções")}</p>
      </div>
      <div className="hidden space-y-2 pt-1 sm:block">
        <p className="text-right text-sm text-muted-foreground" data-testid={`text-mentions-${row.category}`}>
          {plural(row.count, "menção", "menções")}
        </p>
        <ShareBar value={row.count} max={max} />
      </div>
    </li>
  );
}

function CategoryList() {
  const rows = useMemo(buildCategoryRows, []);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("mentions");
  const max = rows[0]?.count ?? 1;

  const query = normalize(search.trim());
  const filtered = useMemo(() => {
    const list = query ? rows.filter((r) => r.searchText.includes(query)) : rows;
    return sortMode === "alpha" ? [...list].sort((a, b) => categoryLabel(a.category).localeCompare(categoryLabel(b.category), "pt-BR")) : list;
  }, [rows, query, sortMode]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title" data-testid="text-page-title">Categorias<span className="text-primary" aria-hidden="true">.</span></h1>
        <p className="page-lead">
          {query ? `${filtered.length} de ${rows.length} categorias` : `${rows.length} categorias com os produtos citados no podcast`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Buscar categoria ou produto"
            aria-label="Buscar categorias"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (e.target.value.length > 2) posthog.capture("category_searched", { query: e.target.value }); }}
            className="h-12 pl-9"
            data-testid="input-search"
          />
        </div>
        <SortButtons
          options={[["mentions", "Mais menções"], ["alpha", "Alfabética"]] as const}
          value={sortMode}
          onChange={(mode) => { setSortMode(mode); posthog.capture("categories_sort_changed", { sort_mode: mode }); }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border-y py-12 text-center">
          <p className="text-muted-foreground">Nenhuma categoria encontrada para “{search.trim()}”.</p>
          <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
            Limpar busca
          </Button>
        </div>
      ) : (
        <ul className="border-t">
          {filtered.map((row) => (
            <CategoryRow key={row.category} row={row} max={max} query={query} />
          ))}
        </ul>
      )}
    </div>
  );
}

type DetailSortMode = "mentions" | "episodes" | "alpha";

function CategoryDetail() {
  const { name } = useParams<{ name: string }>();
  const category = decodeURIComponent(name!);
  const [sortMode, setSortMode] = useState<DetailSortMode>("mentions");

  const { products, episodeCount } = useMemo(() => {
    const allEpisodeIds = new Set<number>();
    const products = getProductsForCategory(category).map((p) => {
      const episodeIds = new Set(getMentionsForProduct(p.id).map((m) => m.episodeId));
      episodeIds.forEach((id) => allEpisodeIds.add(id));
      return { ...p, episodeCount: episodeIds.size };
    });
    return { products, episodeCount: allEpisodeIds.size };
  }, [category]);

  const sorted = useMemo(() => {
    if (sortMode === "alpha") return [...products].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (sortMode === "episodes") return [...products].sort((a, b) => b.episodeCount - a.episodeCount || b.mentionCount - a.mentionCount);
    return products;
  }, [products, sortMode]);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Categoria não encontrada.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
    );
  }

  const totalMentions = products.reduce((sum, p) => sum + p.mentionCount, 0);
  const maxMentions = Math.max(...products.map((p) => p.mentionCount));

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 text-muted-foreground" data-testid="button-back">
          <Link href="/categories">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Categorias
          </Link>
        </Button>
        <h1 className="detail-title" data-testid="text-category-name">{categoryLabel(category)}</h1>
      </div>

      <StatBand
        className="grid-cols-3"
        items={[
          { label: "Menções", value: totalMentions },
          { label: "Produtos", value: products.length },
          { label: "Episódios", value: episodeCount },
        ]}
      />

      <div className="space-y-4">
        <SortButtons
          options={[["mentions", "Menções"], ["episodes", "Episódios"], ["alpha", "A–Z"]] as const}
          value={sortMode}
          onChange={(mode) => { setSortMode(mode); posthog.capture("category_products_sort_changed", { category, sort_mode: mode }); }}
        />
        <ol className="border-t">
          {sorted.map((product, i) => (
            <li
              key={product.id}
              className="relative grid grid-cols-[2rem_1fr] items-start gap-x-3 gap-y-1 border-b px-2 py-4 transition-colors hover:bg-highlight sm:grid-cols-[2.5rem_1fr_8rem] sm:gap-x-4 sm:px-4"
              data-testid={`row-product-${product.id}`}
            >
              <span className="pt-0.5 text-right text-sm font-bold tabular-nums text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 space-y-1">
                <h2 className="text-lg font-bold leading-snug tracking-[-0.01em]">
                  <Link
                    href={`/products/${product.id}`}
                    className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
                  >
                    {product.name}
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground">
                  <span className="sm:hidden">{plural(product.mentionCount, "menção", "menções")} · </span>
                  em {plural(product.episodeCount, "episódio", "episódios")}
                </p>
              </div>
              <div className="hidden space-y-2 pt-1 sm:block">
                <p className="text-right text-sm text-muted-foreground">{plural(product.mentionCount, "menção", "menções")}</p>
                <ShareBar value={product.mentionCount} max={maxMentions} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const params = useParams<{ name: string }>();
  if (params.name) return <CategoryDetail />;
  return <CategoryList />;
}
