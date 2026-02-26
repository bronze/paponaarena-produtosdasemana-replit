import { Link, useParams } from "wouter";
import { ArrowLeft, ExternalLink, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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

function ProductList() {
  const [search, setSearch] = useState("");
  const allProducts = getLeaderboardProducts();
  const filtered = search
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : allProducts;

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

      <div className="grid gap-2">
        {filtered.map((product, i) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <div
              className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card transition-colors hover:bg-accent/50 cursor-pointer"
              data-testid={`card-product-${product.id}`}
            >
              <span className="text-lg font-bold text-muted-foreground w-8 text-right">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{product.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-semibold">{product.mentionCount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
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
    .sort((a, b) => b[1] - a[1])
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
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{product.category}</Badge>
            <span className="text-sm text-muted-foreground">{allMentions.length} menções</span>
          </div>
        </div>
      </div>

      {product.url && (
        <a href={product.url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" data-testid="link-product-url">
            <ExternalLink className="mr-1 h-3 w-3" /> Visitar site
          </Button>
        </a>
      )}

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
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allMentions.map((m) => {
                const person = getPerson(m.personId);
                const episode = getEpisode(m.episodeId);
                return (
                  <div key={m.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
                    <div>
                      <Link href={`/people/${m.personId}`} className="text-sm hover:underline">
                        {person?.name || m.personId}
                      </Link>
                      {m.context && <span className="text-xs text-muted-foreground ml-2">({m.context})</span>}
                    </div>
                    <Link href={`/episodes/${m.episodeId}`}>
                      <Badge variant="outline" className="text-xs cursor-pointer">
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
