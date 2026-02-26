import { Link } from "wouter";
import { BarChart3, Mic, Package, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  getTotalStats,
  getLeaderboardProducts,
  getCategoryStats,
  getMentionsPerEpisodeTrend,
  getRecentMentions,
  getProduct,
  getPerson,
  getEpisode,
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

  const statCards = [
    { label: "Episódios", value: stats.totalEpisodes, icon: Mic, color: "text-blue-500" },
    { label: "Produtos", value: stats.totalProducts, icon: Package, color: "text-green-500" },
    { label: "Menções", value: stats.totalMentions, icon: TrendingUp, color: "text-purple-500" },
    { label: "Pessoas", value: stats.totalPeople, icon: Users, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Papo na Arena Radar</h1>
        <p className="text-muted-foreground">Dashboard de produtos e serviços mencionados no podcast</p>
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
