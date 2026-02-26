import { Link, useParams } from "wouter";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { getCategoryStats, getProductsForCategory } from "@/lib/data-utils";

function CategoryList() {
  const stats = getCategoryStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Categorias</h1>
        <p className="text-muted-foreground">{stats.length} categorias de produtos</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={Math.max(300, stats.length * 30)}>
            <BarChart data={stats} layout="vertical" margin={{ left: 0, right: 16 }}>
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="category"
                width={130}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} name="Menções" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((cat) => (
          <Link key={cat.category} href={`/categories/${encodeURIComponent(cat.category)}`}>
            <div
              className="p-4 rounded-lg border border-border/60 bg-card transition-colors hover:bg-accent/50 cursor-pointer"
              data-testid={`card-category-${cat.category}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{cat.category}</h3>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-semibold">{cat.count}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
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
