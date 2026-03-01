import { Link, useParams } from "wouter";
import { ArrowLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { getCategoryStats, getProductsForCategory } from "@/lib/data-utils";

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

function CategoryDetail() {
  const { name } = useParams<{ name: string }>();
  const category = decodeURIComponent(name!);
  const productsInCat = getProductsForCategory(category);
  const totalMentions = productsInCat.reduce((sum, p) => sum + p.mentionCount, 0);

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
          <p className="text-sm text-muted-foreground">{productsInCat.length} produtos · {totalMentions} menções</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={Math.max(200, productsInCat.length * 30)}>
            <BarChart data={productsInCat.slice(0, 20)} layout="vertical" margin={{ left: 0, right: 16 }}>
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

      <div className="grid gap-2">
        {productsInCat.map((product, i) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <div
              className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card transition-colors hover:bg-accent/50 cursor-pointer"
              data-testid={`card-product-${product.id}`}
            >
              <span className="text-lg font-bold text-muted-foreground w-8 text-right">{i + 1}</span>
              <span className="font-medium text-sm flex-1">{product.name}</span>
              <div className="flex items-center gap-1 shrink-0">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-semibold">{product.mentionCount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const params = useParams<{ name: string }>();
  if (params.name) return <CategoryDetail />;
  return <CategoryList />;
}
