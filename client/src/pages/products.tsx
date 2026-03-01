import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, ExternalLink, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  getLeaderboardProducts,
  getMentionsForProduct,
  getProduct,
  getPerson,
  getEpisode,
  getChildProducts,
} from "@/lib/data-utils";

type SortColumn = "name" | "mentions" | "episodes";
type SortDir = "asc" | "desc";

function ProductList() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<SortColumn>("mentions");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showAll, setShowAll] = useState(false);

  const productsWithEpisodes = useMemo(() => {
    const all = getLeaderboardProducts();
    return all.map((p) => {
      const m = getMentionsForProduct(p.id);
      const uniqueEpisodes = new Set(m.map((x) => x.episodeId));
      return { ...p, episodeCount: uniqueEpisodes.size };
    });
  }, []);

  const filtered = search
    ? productsWithEpisodes.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : productsWithEpisodes;

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortCol === "name") {
        cmp = a.name.localeCompare(b.name, "pt-BR");
      } else if (sortCol === "mentions") {
        cmp = a.mentionCount - b.mentionCount;
      } else {
        cmp = a.episodeCount - b.episodeCount;
      }
      if (cmp === 0 && sortCol !== "mentions") {
        cmp = a.mentionCount - b.mentionCount;
      }
      if (cmp === 0 && sortCol !== "episodes") {
        cmp = a.episodeCount - b.episodeCount;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return arr;
  }, [filtered, sortCol, sortDir]);

  function handleSort(col: SortColumn) {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir(col === "name" ? "asc" : "desc");
    }
  }

  function SortIcon({ col }: { col: SortColumn }) {
    if (sortCol !== col) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  }

  const rankedSorted = sorted.map((p, i) => ({ ...p, rank: i + 1 }));
  const primary = rankedSorted.filter((p) => p.mentionCount > 2);
  const secondary = rankedSorted.filter((p) => p.mentionCount <= 2);
  const displayed = search ? rankedSorted : showAll ? rankedSorted : primary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Produtos</h1>
        <p className="text-muted-foreground">Ranking de produtos mencionados no podcast</p>
      </div>

      <Input
        placeholder="Buscar produto ou categoria..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
        data-testid="input-search"
      />

      <div className="rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>
                <button
                  className="flex items-center text-xs font-medium uppercase tracking-wide"
                  onClick={() => handleSort("name")}
                  data-testid="sort-name"
                >
                  Nome <SortIcon col="name" />
                </button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">Categoria</TableHead>
              <TableHead className="text-right">
                <button
                  className="ml-auto flex items-center text-xs font-medium uppercase tracking-wide"
                  onClick={() => handleSort("mentions")}
                  data-testid="sort-mentions"
                >
                  Menções <SortIcon col="mentions" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  className="ml-auto flex items-center text-xs font-medium uppercase tracking-wide"
                  onClick={() => handleSort("episodes")}
                  data-testid="sort-episodes"
                >
                  Episódios <SortIcon col="episodes" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayed.map((product) => (
              <TableRow key={product.id} className="cursor-pointer hover:bg-accent/50" onClick={() => navigate(`/products/${product.id}`)} data-testid={`row-product-${product.id}`}>
                <TableCell className="text-center font-bold text-muted-foreground">{product.rank}</TableCell>
                <TableCell className="font-medium text-sm" data-testid={`link-product-${product.id}`}>
                  {product.name}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">{product.mentionCount}</TableCell>
                <TableCell className="text-right text-muted-foreground">{product.episodeCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!search && secondary.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => setShowAll((s) => !s)}>
            {showAll
              ? "Ver menos"
              : `Ver mais (${secondary.length} produto${secondary.length !== 1 ? "s" : ""})`}
          </Button>
        </div>
      )}

      {displayed.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Nenhum produto encontrado.</p>
      )}
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = getProduct(id!);

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Produto não encontrado.</p>
        <Link href="/products">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const allMentions = getMentionsForProduct(product.id);
  const children = getChildProducts(product.id);

  const episodeCounts = new Map<number, number>();
  for (const m of allMentions) {
    episodeCounts.set(m.episodeId, (episodeCounts.get(m.episodeId) || 0) + 1);
  }
  const episodeData = Array.from(episodeCounts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([epId, count]) => ({
      episode: `#${epId}`,
      count,
      episodeId: epId,
    }));

  const personCounts = new Map<string, number>();
  for (const m of allMentions) {
    personCounts.set(m.personId, (personCounts.get(m.personId) || 0) + 1);
  }
  const topPeople = Array.from(personCounts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return (getPerson(a[0])?.name || a[0]).localeCompare(getPerson(b[0])?.name || b[0], "pt");
    })
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2">
        <Link href="/products">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-product-name">{product.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="secondary">{product.category}</Badge>
            <span className="text-sm text-muted-foreground">{allMentions.length} menções</span>
            {product.url && (
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" data-testid="link-product-url">
                  <ExternalLink className="mr-1 h-3 w-3" /> Visitar site
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Variantes / Sub-produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {children.map((c) => (
                <Badge key={c.id} variant="outline">{c.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {episodeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menções por Episódio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={episodeData}>
                <XAxis dataKey="episode" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quem mais mencionou</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPeople.map(([personId, count]) => {
                const person = getPerson(personId);
                return (
                  <div key={personId} className="flex items-center justify-between py-1">
                    <Link href={`/people/${personId}`} className="text-sm hover:underline">
                      {person?.name || personId}
                    </Link>
                    <span className="text-sm font-semibold text-muted-foreground">{count}x</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Todas as menções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...allMentions].sort((a, b) => {
                if (b.episodeId !== a.episodeId) return b.episodeId - a.episodeId;
                return (getPerson(a.personId)?.name || a.personId).localeCompare(getPerson(b.personId)?.name || b.personId, "pt");
              }).map((m) => {
                const person = getPerson(m.personId);
                const episode = getEpisode(m.episodeId);
                return (
                  <div key={m.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
                    <div>
                      <Link href={`/people/${m.personId}`} className="text-sm hover:underline">
                        {person?.name || m.personId}
                      </Link>
                      {m.context && <span className="text-sm text-muted-foreground ml-2">({m.context})</span>}
                    </div>
                    <Link href={`/episodes/${m.episodeId}`}>
                      <Badge variant="outline" className="text-sm cursor-pointer">
                        #{m.episodeId}
                      </Badge>
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const params = useParams<{ id: string }>();
  if (params.id) return <ProductDetail />;
  return <ProductList />;
}
