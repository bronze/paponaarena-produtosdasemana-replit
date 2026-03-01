import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, ChevronRight, TrendingUp, Mic, Package, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
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
import { getCategoryStats, getProductsForCategory, getMentionsForProduct, episodes } from "@/lib/data-utils";

type SortMode = "mentions" | "alpha";

function CategoryList() {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("mentions");

  const statsWithProducts = useMemo(() => {
    return getCategoryStats().map((cat) => {
      const products = getProductsForCategory(cat.category);
      return { ...cat, productCount: products.length, topProducts: products.slice(0, 3) };
    });
  }, []);

  const filtered = useMemo(() => {
    let list = statsWithProducts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (cat) =>
          cat.category.toLowerCase().includes(q) ||
          cat.topProducts.some((p) => p.name.toLowerCase().includes(q))
      );
    }
    if (sortMode === "alpha") {
      list = [...list].sort((a, b) => a.category.localeCompare(b.category, "pt-BR"));
    }
    return list;
  }, [statsWithProducts, search, sortMode]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Categorias</h1>
        <p className="text-muted-foreground">Categorias de produtos mencionados no podcast</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Input
          placeholder="Buscar categoria ou produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          data-testid="input-search"
        />
        <div className="flex gap-1">
          <Button
            variant={sortMode === "mentions" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortMode("mentions")}
            data-testid="sort-mentions"
          >
            Mais menções
          </Button>
          <Button
            variant={sortMode === "alpha" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortMode("alpha")}
            data-testid="sort-alpha"
          >
            Alfabética
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((cat) => (
          <Link key={cat.category} href={`/categories/${encodeURIComponent(cat.category)}`}>
            <div
              className="flex items-center gap-3 p-4 rounded-lg border border-border/60 bg-card transition-colors hover:bg-accent/50 cursor-pointer h-full"
              data-testid={`card-category-${cat.category}`}
            >
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="font-semibold text-sm">{cat.category}</h3>
                <p className="text-xs text-muted-foreground">
                  {cat.count} menções · {cat.productCount} produtos
                </p>
                <div className="flex flex-wrap gap-1">
                  {cat.topProducts.map((p) => (
                    <Badge key={p.id} variant="secondary" className="text-[10px] font-normal">
                      {p.name} ({p.mentionCount})
                    </Badge>
                  ))}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Nenhuma categoria encontrada.</p>
      )}
    </div>
  );
}

type DetailSortColumn = "name" | "mentions" | "episodes";
type SortDir = "asc" | "desc";

function CategoryDetail() {
  const { name } = useParams<{ name: string }>();
  const [, navigate] = useLocation();
  const category = decodeURIComponent(name!);
  const productsInCat = getProductsForCategory(category);
  const totalMentions = productsInCat.reduce((sum, p) => sum + p.mentionCount, 0);

  const [sortCol, setSortCol] = useState<DetailSortColumn>("mentions");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const productsWithEpisodes = useMemo(() => {
    return productsInCat.map((p) => {
      const m = getMentionsForProduct(p.id);
      const uniqueEpisodes = new Set(m.map((x) => x.episodeId));
      return { ...p, episodeCount: uniqueEpisodes.size };
    });
  }, [category]);

  const categoryEpisodeCount = useMemo(() => {
    const allEpIds = new Set<number>();
    productsWithEpisodes.forEach((p) => {
      const m = getMentionsForProduct(p.id);
      m.forEach((x) => allEpIds.add(x.episodeId));
    });
    return allEpIds.size;
  }, [category]);

  const sorted = useMemo(() => {
    const arr = [...productsWithEpisodes];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortCol === "name") {
        cmp = a.name.localeCompare(b.name, "pt-BR");
      } else if (sortCol === "mentions") {
        cmp = a.mentionCount - b.mentionCount;
      } else {
        cmp = a.episodeCount - b.episodeCount;
      }
      if (cmp === 0 && sortCol !== "mentions") cmp = a.mentionCount - b.mentionCount;
      if (cmp === 0 && sortCol !== "episodes") cmp = a.episodeCount - b.episodeCount;
      return sortDir === "desc" ? -cmp : cmp;
    });
    return arr;
  }, [productsWithEpisodes, sortCol, sortDir]);

  function handleSort(col: DetailSortColumn) {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir(col === "name" ? "asc" : "desc");
    }
  }

  function DetailSortIcon({ col }: { col: DetailSortColumn }) {
    if (sortCol !== col) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  }

  if (productsInCat.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Categoria não encontrada.</p>
        <Link href="/categories">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const statCards = [
    { label: "Total de Menções", value: totalMentions, icon: TrendingUp, color: "text-purple-500" },
    { label: "Produtos", value: productsInCat.length, icon: Package, color: "text-green-500" },
    { label: "Episódios", value: `${categoryEpisodeCount}/${episodes.length}`, icon: Mic, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/categories">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-category-name">{category}</h1>
          <p className="text-sm text-muted-foreground">Visão geral da categoria</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Produtos em {category}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(200, Math.min(productsInCat.length, 10) * 30)}>
            <BarChart data={productsWithEpisodes.slice(0, 10)} layout="vertical" margin={{ left: 0, right: 16 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Bar dataKey="mentionCount" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} name="Menções" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
                  Produto <DetailSortIcon col="name" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  className="ml-auto flex items-center text-xs font-medium uppercase tracking-wide"
                  onClick={() => handleSort("mentions")}
                  data-testid="sort-mentions"
                >
                  Menções <DetailSortIcon col="mentions" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  className="ml-auto flex items-center text-xs font-medium uppercase tracking-wide"
                  onClick={() => handleSort("episodes")}
                  data-testid="sort-episodes"
                >
                  Episódios <DetailSortIcon col="episodes" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((product, i) => (
              <TableRow key={product.id} className="cursor-pointer hover:bg-accent/50" onClick={() => navigate(`/products/${product.id}`)} data-testid={`row-product-${product.id}`}>
                <TableCell className="text-center font-bold text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium text-sm">{product.name}</TableCell>
                <TableCell className="text-right font-semibold">{product.mentionCount}</TableCell>
                <TableCell className="text-right text-muted-foreground">{product.episodeCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const params = useParams<{ name: string }>();
  if (params.name) return <CategoryDetail />;
  return <CategoryList />;
}
