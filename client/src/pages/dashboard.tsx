import { Link } from "wouter";
import { lazy, Suspense } from "react";
import { posthog } from "@/lib/analytics";
import { BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LatestEpisode } from "@/components/latest-episode";
import { StatBand } from "@/components/stat-band";
import {
  episodes,
  getTotalStats,
  getLeaderboardProducts,
  getMentionsPerEpisodeTrend,
  getParticipantsPerEpisodeTrend,
  getProduct,
  getMentionsForEpisode,
  getEpisodeCast,
  resolveParent,
  getTopProductsAscension,
  getTopProductNames,
  getAICompanyMentionStats,
} from "@/lib/data-utils";

const TopProductsChart = lazy(() => import("./dashboard-charts").then((m) => ({ default: m.TopProductsChart })));
const AiCompanyChart = lazy(() => import("./dashboard-charts").then((m) => ({ default: m.AiCompanyChart })));
const AscensionChart = lazy(() => import("./dashboard-charts").then((m) => ({ default: m.AscensionChart })));
const TrendChart = lazy(() => import("./dashboard-charts").then((m) => ({ default: m.TrendChart })));
const ParticipantsChart = lazy(() => import("./dashboard-charts").then((m) => ({ default: m.ParticipantsChart })));

export default function Dashboard() {
  const stats = getTotalStats();
  const topProducts = getLeaderboardProducts().slice(0, 10);
  const trend = getMentionsPerEpisodeTrend();
  const participantsTrend = getParticipantsPerEpisodeTrend();

  const ascensionData = getTopProductsAscension(6);
  const topProductNames = getTopProductNames(6);
  const aiCompanyStats = getAICompanyMentionStats();

  const latestEpisode = [...episodes].sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestMentions = getMentionsForEpisode(latestEpisode.id);
  const latestProducts = Array.from(
    latestMentions.reduce((acc, m) => {
      const id = resolveParent(m.productId);
      acc.set(id, (acc.get(id) || 0) + 1);
      return acc;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => getProduct(id))
    .filter((p) => p !== undefined);
  const latestCast = getEpisodeCast(latestEpisode.id);

  const statCards = [
    {label: "Menções", value: stats.totalMentions, href: "/products"},
    {label: "Episódios", value: stats.totalEpisodes, href: "/episodes"},
    { label: "Produtos", value: stats.totalProducts, href: "/products" },
    { label: "Pessoas", value: stats.totalPeople, href: "/people" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title" data-testid="text-page-title">Papo na Arena Radar<span className="text-primary" aria-hidden="true">.</span></h1>
        <p className="page-lead">
          Radar dos produtos e serviços citados no podcast <strong className="font-semibold text-foreground">Papo na Arena</strong>, com Arthur Castro e Aíquis Rodrigues.
          <Link href="/sobre" className="block w-fit underline-offset-2 hover:underline">Saiba mais</Link>
        </p>
      </div>

      <StatBand
        className="grid-cols-2 lg:grid-cols-4"
        items={statCards.map((stat) => ({
          ...stat,
          onClick: () => posthog.capture("dashboard_stat_card_clicked", { label: stat.label, destination: stat.href }),
        }))}
      />

      <LatestEpisode
        variant="escuro"
        episode={latestEpisode}
        cast={[...latestCast.hosts, ...latestCast.cohosts]}
        mentionCount={latestMentions.length}
        products={latestProducts}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Top 10 Produtos</CardTitle>
            <Link href="/products" className="text-sm text-muted-foreground flex items-center gap-1" data-testid="link-all-products">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div style={{ height: 300 }} />}>
              <TopProductsChart data={topProducts} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menções por Empresa de AI</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div style={{ height: 192 }} />}>
              <AiCompanyChart data={aiCompanyStats} />
            </Suspense>
            <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              <p><span className="company-legend" style={{ "--c": "#d97706" } as React.CSSProperties}>Anthropic:</span> Claude, Claude Code, Claude Design e variantes</p>
              <p><span className="company-legend" style={{ "--c": "#10a37f" } as React.CSSProperties}>OpenAI:</span> ChatGPT, Codex e variantes</p>
              <p><span className="company-legend" style={{ "--c": "#4285F4" } as React.CSSProperties}>Google:</span> Gemini, Google Flow e variantes</p>
              <p><span className="company-legend" style={{ "--c": "#F26207" } as React.CSSProperties}>Replit:</span> Replit, Replit Canvas e variantes</p>
              <p><span className="company-legend" style={{ "--c": "#8B5CF6" } as React.CSSProperties}>Cursor:</span> Cursor e variantes</p>
              <p><span className="company-legend" style={{ "--c": "#64748B" } as React.CSSProperties}>xAI:</span> Grok, Grokbot e variantes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ascensão dos Top 6 Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div style={{ height: 280 }} />}>
            <AscensionChart data={ascensionData} names={topProductNames} />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Menções por Episódio</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div style={{ height: 250 }} />}>
            <TrendChart data={trend} />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participantes por Episódio</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div style={{ height: 250 }} />}>
            <ParticipantsChart data={participantsTrend} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
