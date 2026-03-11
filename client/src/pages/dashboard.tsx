import { Link } from "wouter";
import { useMemo } from "react";
import { motion } from "framer-motion";
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
  resolveParent,
} from "@/lib/data-utils";

const CONFETTI_COLORS = ["#f59e0b", "#fbbf24", "#fcd34d", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];

function MilestoneConfetti() {
  const particles = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: Math.random() * 6 + 5,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: Math.random() * 1.5 + 1.5,
      rotate: Math.random() * 720 - 360,
      repeatDelay: Math.random() * 3 + 2,
    })), []
  );
  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.5, backgroundColor: p.color }}
          initial={{ y: -10, opacity: 1, rotate: 0 }}
          animate={{ y: 140, opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn", repeat: Infinity, repeatDelay: p.repeatDelay }}
        />
      ))}
    </div>
  );
}

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
  const latestTop3 = Array.from(
    latestMentions.reduce((acc, m) => {
      const id = resolveParent(m.productId);
      acc.set(id, (acc.get(id) || 0) + 1);
      return acc;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => getProduct(id))
    .filter(Boolean);

  const statCards = [
    { label: "Episódios", value: stats.totalEpisodes, icon: Mic, color: "text-blue-500", href: "/episodes" },
    { label: "Produtos", value: stats.totalProducts, icon: Package, color: "text-green-500", href: "/products" },
    { label: "Pessoas", value: stats.totalPeople, icon: Users, color: "text-orange-500", href: "/people" },
    { label: "Menções", value: stats.totalMentions, icon: TrendingUp, color: "text-purple-500", href: "/products" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Papo na Arena Radar</h1>
        <p className="text-muted-foreground">Dashboard de produtos e serviços mencionados no podcast</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="cursor-pointer transition-colors hover:bg-accent/50">
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
          </Link>
        ))}
      </div>

      {/* 1000th mention milestone banner */}
      <Link href="/episodes/108" className="mt-2 block">
        <Card className="relative border-amber-400 bg-amber-50 dark:bg-amber-950/20 cursor-pointer transition-opacity hover:opacity-90">
          <MilestoneConfetti />
          <CardContent className="pt-5 pb-5 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-amber-800 dark:text-amber-300 text-base leading-snug">
                  Produto #1000 — Marco histórico!
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                  <Link href="/people/larissa-araujo" className="font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
                    Larissa Araújo
                  </Link>
                  {" "}mencionou{" "}
                  <Link href="/products/claude-code" className="font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
                    Claude Code
                  </Link>
                  {" "}no Ep. 108
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 hidden sm:block" />
            </div>
          </CardContent>
        </Card>
      </Link>

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

        <div className="space-y-6">
          <Link href={`/episodes/${latestEpisode.id}`}>
            <div className="rounded-lg bg-primary p-5 text-primary-foreground cursor-pointer transition-opacity hover:opacity-90" data-testid="card-latest-episode">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">Último Episódio</Badge>
                  <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">#{latestEpisode.id}</Badge>
                </div>
                <h2 className="text-lg font-bold leading-tight" data-testid="text-latest-title">{latestEpisode.title}</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm opacity-80">
                    <Package className="h-3.5 w-3.5" />
                    <span data-testid="text-latest-products">{latestMentions.length} menções</span>
                  </div>
                  <span className="text-sm font-medium opacity-80 flex items-center gap-1">
                    Ver Episódio <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                {latestTop3.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {latestTop3.map((product) => (
                      <Badge key={product!.id} className="bg-primary-foreground/20 text-primary-foreground border-0 text-xs">
                        {product!.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>

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
                    itemStyle={{ color: "hsl(var(--card-foreground))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
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
                      <span className="text-sm text-muted-foreground">
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
                    <span className="text-sm text-muted-foreground">{episodeDate}</span>
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
