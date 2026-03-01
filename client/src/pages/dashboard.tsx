import { Link } from "wouter";
import { BarChart3, Mic, Package, Users, TrendingUp, ArrowRight, Play } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  episodes,
  getTotalStats,
  getLeaderboardProducts,
  getCategoryStats,
  getMentionsPerEpisodeTrend,
  getRecentMentions,
  getProduct,
  getPerson,
  getEpisode,
  getMentionsForEpisode,
} from "@/lib/data-utils";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export default function Dashboard() {
  const stats = getTotalStats();
  const topProducts = getLeaderboardProducts().slice(0, 10);
  const categoryStats = getCategoryStats().slice(0, 8);
  const trend = getMentionsPerEpisodeTrend();
  const recentMentions = getRecentMentions(8);

  const latestEpisode = [...episodes].sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestMentions = getMentionsForEpisode(latestEpisode.id);
  const latestProductCount = new Set(latestMentions.map((m) => m.productId)).size;

  const statCards = [
    { label: "Episódios", value: stats.totalEpisodes, icon: Mic, color: "text-blue-500" },
    { label: "Produtos", value: stats.totalProducts, icon: Package, color: "text-green-500" },
    { label: "Pessoas", value: stats.totalPeople, icon: Users, color: "text-orange-500" },
    { label: "Menções", value: stats.totalMentions, icon: TrendingUp, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Papo na Arena Radar</h1>
        <p className="text-muted-foreground">Dashboard de produtos e serviços mencionados no podcast</p>
      </div>

      <div className="rounded-lg bg-primary p-5 text-primary-foreground" data-testid="card-latest-episode">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">Último Episódio</Badge>
              <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">#{latestEpisode.id}</Badge>
            </div>
            <h2 className="text-lg font-bold leading-tight" data-testid="text-latest-title">{latestEpisode.title}</h2>
            <div className="flex items-center gap-1 text-sm opacity-80">
              <Package className="h-3.5 w-3.5" />
              <span data-testid="text-latest-products">{latestProductCount} produtos mencionados</span>
            </div>
          </div>
          <Link href={`/episodes/${latestEpisode.id}`}>
            <Button variant="secondary" className="gap-2 shrink-0" data-testid="button-latest-episode">
              <Play className="h-4 w-4" /> Ver Episódio
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold" data-testid={`stat-${stat.label.toLowerCase()}`}>{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Top 10 Produtos</CardTitle>
            <Link href="/products" className="text-sm text-muted-foreground flex items-center gap-1" data-testid="link-all-products">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
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
                <Bar dataKey="mentionCount" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} name="Menções" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Categorias</CardTitle>
            <Link href="/categories" className="text-sm text-muted-foreground flex items-center gap-1" data-testid="link-all-categories">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, percent }) =>
                    `${category} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {categoryStats.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--card-foreground))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Menções por Episódio</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trend} margin={{ left: 0, right: 16 }}>
              <XAxis dataKey="episode" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  color: "hsl(var(--card-foreground))",
                }}
                labelFormatter={(label) => {
                  const item = trend.find((t) => t.episode === label);
                  return item ? `Ep ${label} - ${item.date}` : label;
                }}
              />
              <Bar dataKey="mentions" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Menções" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Menções Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMentions.map(({ mention, episodeDate }) => {
              const product = getProduct(mention.productId);
              const person = getPerson(mention.personId);
              const episode = getEpisode(mention.episodeId);
              return (
                <div
                  key={mention.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0"
                  data-testid={`mention-${mention.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <Link href={`/products/${mention.productId}`} className="text-sm font-medium truncate hover:underline">
                        {product?.name || mention.productId}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        por{" "}
                        <Link href={`/people/${mention.personId}`} className="hover:underline">
                          {person?.name || mention.personId}
                        </Link>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      <Link href={`/episodes/${mention.episodeId}`}>
                        #{mention.episodeId}
                      </Link>
                    </Badge>
                    <span className="text-xs text-muted-foreground">{episodeDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
