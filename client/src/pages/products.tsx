import { categoryLabel } from "@/lib/categories";
import { Link, useParams } from "wouter";
import { ArrowLeft, ExternalLink, Search, Mic, Users } from "lucide-react";
import { posthog } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatBand } from "@/components/stat-band";
import { LoadMore, RankRow, ShowAllButton, SortButtons, plural } from "@/components/ranking";
import { useState, useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { normalize, joinNames } from "@/lib/text";
import {
  episodes,
  getLeaderboardProducts,
  getMentionsForProduct,
  getProduct,
  getPerson,
  getEpisode,
  getChildProducts,
} from "@/lib/data-utils";

const INITIAL_COUNT = 30;
const LOAD_MORE_COUNT = 100;
const DETAIL_LIST_LIMIT = 20;
/** Com menos episódios que isso, o gráfico por episódio não mostra evolução nenhuma. */
const MIN_EPISODES_FOR_CHART = 3;

type SortMode = "mentions" | "episodes" | "alpha";

function buildProductRows() {
  const rows = getLeaderboardProducts().map((p, i) => ({
    ...p,
    rank: i + 1,
    episodeCount: new Set(getMentionsForProduct(p.id).map((m) => m.episodeId)).size,
    searchText: normalize([p.name, p.category, categoryLabel(p.category)].join(" ")),
    episodeRank: 0,
  }));
  const byEpisodes = [...rows].sort((a, b) => b.episodeCount - a.episodeCount || a.rank - b.rank);
  byEpisodes.forEach((p, i) => (p.episodeRank = i + 1));
  return rows;
}

function CategoryLink({ category, className = "font-semibold text-foreground" }: { category: string; className?: string }) {
  return (
    <Link href={`/categories/${encodeURIComponent(category)}`} className={`underline-offset-2 hover:underline ${className}`}>
      {categoryLabel(category)}
    </Link>
  );
}

function ProductList() {
  const rows = useMemo(buildProductRows, []);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("mentions");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const query = normalize(search.trim());
  const filtered = useMemo(() => {
    const list = query ? rows.filter((r) => r.searchText.includes(query)) : rows;
    if (sortMode === "alpha") return [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (sortMode === "episodes") return [...list].sort((a, b) => a.episodeRank - b.episodeRank);
    return list;
  }, [rows, query, sortMode]);
  // O número da direita (com a barra) é sempre o critério da ordenação; o outro vai no texto
  const byEpisodes = sortMode === "episodes";
  const max = Math.max(1, ...rows.map((r) => (byEpisodes ? r.episodeCount : r.mentionCount)));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title" data-testid="text-page-title">Produtos<span className="text-primary" aria-hidden="true">.</span></h1>
        <p className="page-lead">
          {query ? `${filtered.length} de ${rows.length} produtos` : `${rows.length.toLocaleString("pt-BR")} produtos citados no podcast, do mais mencionado ao menos`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Buscar produto ou categoria"
            aria-label="Buscar produtos"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(INITIAL_COUNT); if (e.target.value.length > 2) posthog.capture("product_searched", { query: e.target.value }); }}
            className="h-12 pl-9"
            data-testid="input-search"
          />
        </div>
        <SortButtons
          options={[["mentions", "Menções"], ["episodes", "Episódios"], ["alpha", "A–Z"]] as const}
          value={sortMode}
          onChange={(mode) => { setSortMode(mode); setVisibleCount(INITIAL_COUNT); posthog.capture("product_sort_changed", { sort_mode: mode }); }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border-y py-12 text-center">
          <p className="text-muted-foreground">Nenhum produto encontrado para “{search.trim()}”.</p>
          <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
            Limpar busca
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <ol className="border-t">
            {filtered.slice(0, visibleCount).map((product) => (
              <RankRow
                key={product.id}
                rank={byEpisodes ? product.episodeRank : product.rank}
                title={product.name}
                href={`/products/${product.id}`}
                onClick={() => posthog.capture("product_viewed", { product_id: product.id, product_name: product.name, source: "list" })}
                count={byEpisodes ? product.episodeCount : product.mentionCount}
                unit={byEpisodes ? ["episódio", "episódios"] : undefined}
                max={max}
                testId={`row-product-${product.id}`}
              >
                <p className="text-sm text-muted-foreground">
                  <CategoryLink category={product.category} className="relative z-10" /> ·{" "}
                  {byEpisodes ? plural(product.mentionCount, "menção", "menções") : `em ${plural(product.episodeCount, "episódio", "episódios")}`}
                </p>
              </RankRow>
            ))}
          </ol>
          <LoadMore
            visible={visibleCount}
            total={filtered.length}
            step={LOAD_MORE_COUNT}
            noun={{ all: "Mostrar todos", lastOne: "o último produto", lastMany: "os últimos" }}
            onShow={(next, mode) => {
              setVisibleCount(next);
              posthog.capture("product_list_expanded", { mode, visible_count: next, total: filtered.length });
            }}
          />
        </div>
      )}
    </div>
  );
}

function ProductDetail({ id }: { id: string }) {
  const product = getProduct(id);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Produto não encontrado.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
    );
  }

  const allMentions = getMentionsForProduct(product.id);
  const children = getChildProducts(product.id);

  // Episódios com menção, do mais recente para o mais antigo
  const mentionsByEpisode = new Map<number, typeof allMentions>();
  for (const m of [...allMentions].sort((a, b) => b.episodeId - a.episodeId)) {
    mentionsByEpisode.set(m.episodeId, [...(mentionsByEpisode.get(m.episodeId) ?? []), m]);
  }
  const episodeIds = Array.from(mentionsByEpisode.keys());
  const shownEpisodes = showAllEpisodes ? episodeIds : episodeIds.slice(0, DETAIL_LIST_LIMIT);

  // Gráfico: todos os episódios desde a primeira menção, com zero onde o produto não apareceu
  const firstDate = episodeIds.map((epId) => getEpisode(epId)?.date ?? "").sort()[0] ?? "";
  const chartData = [...episodes]
    .filter((ep) => ep.date >= firstDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((ep) => ({ episode: `#${ep.id}`, count: mentionsByEpisode.get(ep.id)?.length ?? 0, title: ep.title }));

  const personCounts = new Map<string, number>();
  for (const m of allMentions) {
    personCounts.set(m.personId, (personCounts.get(m.personId) || 0) + 1);
  }
  const topPeople = Array.from(personCounts.entries())
    .sort((a, b) => b[1] - a[1] || (getPerson(a[0])?.name || a[0]).localeCompare(getPerson(b[0])?.name || b[0], "pt"))
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 text-muted-foreground" data-testid="button-back">
          <Link href="/products">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Produtos
          </Link>
        </Button>
        <h1 className="detail-title" data-testid="text-product-name">{product.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <CategoryLink category={product.category} />
          {children.length > 0 && <> · inclui também {joinNames(children.map((c) => c.name))}</>}
        </p>
        {product.url && (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-12 items-center gap-2 rounded-full border bg-card px-5 text-sm font-semibold outline-none transition-colors hover:bg-highlight focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => posthog.capture("product_url_clicked", { product_id: product.id, product_name: product.name })}
            data-testid="link-product-url"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Visitar site
          </a>
        )}
      </div>

      <StatBand
        className="grid-cols-3"
        items={[
          { label: "Menções", value: allMentions.length },
          { label: "Episódios", value: episodeIds.length },
          { label: "Pessoas", value: personCounts.size },
        ]}
      />

      {episodeIds.length >= MIN_EPISODES_FOR_CHART && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menções por episódio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ left: -16, right: 8 }}>
                <XAxis dataKey="episode" tick={{ fontSize: 12 }} interval="preserveStartEnd" minTickGap={16} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--highlight))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--card-foreground))",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Menções" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mic className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Episódios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {shownEpisodes.map((epId) => {
                const episode = getEpisode(epId);
                return (
                  <li key={epId} className="space-y-1 border-b border-border/40 py-3 first:pt-0 last:border-0">
                    <Link href={`/episodes/${epId}`} className="block text-sm font-medium leading-snug hover:underline">
                      <span className="font-bold tabular-nums">#{epId}</span>
                      {episode && <span className="text-muted-foreground"> · </span>}
                      {episode?.title}
                    </Link>
                    <p className="text-sm">
                      {mentionsByEpisode.get(epId)!.map((m, i) => {
                        // Menção feita por uma variante ou combo: mostra o nome registrado
                        const variant = m.productId !== product.id ? getProduct(m.productId)?.name : undefined;
                        return (
                          <span key={m.id}>
                            {i > 0 && <span className="text-muted-foreground" aria-hidden="true"> · </span>}
                            <Link href={`/people/${m.personId}`} className="font-semibold underline-offset-2 hover:underline">
                              {getPerson(m.personId)?.name || m.personId}
                            </Link>
                            {variant && <span className="text-muted-foreground"> ({variant})</span>}
                            {m.context && <span className="italic text-muted-foreground"> — {m.context}</span>}
                          </span>
                        );
                      })}
                    </p>
                  </li>
                );
              })}
            </ul>
            {!showAllEpisodes && episodeIds.length > DETAIL_LIST_LIMIT && (
              <ShowAllButton total={episodeIds.length} onClick={() => setShowAllEpisodes(true)} />
            )}
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Quem mais citou
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol>
              {topPeople.map(([personId, count], index) => (
                <li key={personId} className="flex items-center justify-between gap-3 border-b border-border/40 py-2 last:border-0">
                  <div className="flex min-w-0 items-baseline gap-2.5">
                    <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{index + 1}</span>
                    <Link href={`/people/${personId}`} className="text-sm font-medium hover:underline">
                      {getPerson(personId)?.name || personId}
                    </Link>
                  </div>
                  {count > 1 && (
                    <span className="ml-2 shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{count}×</span>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const params = useParams<{ id: string }>();
  if (params.id) return <ProductDetail key={params.id} id={params.id} />;
  return <ProductList />;
}
