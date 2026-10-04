import { Link, useParams } from "wouter";
import { ArrowLeft, Search } from "lucide-react";
import { posthog } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatBand } from "@/components/stat-band";
import { RankRow, SortButtons, plural } from "@/components/ranking";
import { useState, useMemo } from "react";
import { normalize } from "@/lib/text";
import { categoryLabel } from "@/lib/categories";
import { getCategoryStats, getProductsForCategory, getMentionsForProduct } from "@/lib/data-utils";

const MAX_LIST_PRODUCTS = 3;

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
    <RankRow
      rank={row.rank}
      title={categoryLabel(row.category)}
      href={`/categories/${encodeURIComponent(row.category)}`}
      onClick={() => posthog.capture("category_viewed", { category: row.category, mention_count: row.count })}
      count={row.count}
      max={max}
      testId={`card-category-${row.category}`}
    >
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
    </RankRow>
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
  // O número da direita (com a barra) é sempre o critério da ordenação; o outro vai no texto
  const byEpisodes = sortMode === "episodes";
  const max = Math.max(...products.map((p) => (byEpisodes ? p.episodeCount : p.mentionCount)));

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
          { label: "Episódios", value: episodeCount },
          { label: "Produtos", value: products.length },
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
            <RankRow
              key={product.id}
              rank={i + 1}
              title={product.name}
              href={`/products/${product.id}`}
              count={byEpisodes ? product.episodeCount : product.mentionCount}
              unit={byEpisodes ? ["episódio", "episódios"] : undefined}
              max={max}
              testId={`row-product-${product.id}`}
            >
              <p className="text-sm text-muted-foreground">
                {byEpisodes ? plural(product.mentionCount, "menção", "menções") : `em ${plural(product.episodeCount, "episódio", "episódios")}`}
              </p>
            </RankRow>
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
