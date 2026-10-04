import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Mic, Package, Search, Users } from "lucide-react";
import { posthog } from "@/lib/analytics";
import { formatLongDate, formatShortDate } from "@/lib/dates";
import { joinNames, normalize } from "@/lib/text";
import { SiYoutube, SiSpotify } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatBand } from "@/components/stat-band";
import {
  episodes,
  getEpisodeCast,
  getMentionsForEpisode,
  getProduct,
  getParticipantsForEpisode,
  resolveParent,
} from "@/lib/data-utils";

const MAX_LIST_PRODUCTS = 4;

type EpisodeRowData = {
  episode: (typeof episodes)[number];
  year: string;
  castNames: string[];
  products: { id: string; name: string }[];
  mentionCount: number;
  searchText: string;
};

function buildEpisodeRows(): EpisodeRowData[] {
  return [...episodes]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((episode) => {
      const mentions = getMentionsForEpisode(episode.id);
      const counts = mentions.reduce((acc, m) => {
        const id = resolveParent(m.productId);
        acc.set(id, (acc.get(id) || 0) + 1);
        return acc;
      }, new Map<string, number>());
      const products = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => getProduct(id))
        .filter((p) => p !== undefined)
        .map((p) => ({ id: p.id, name: p.name }));
      const cast = getEpisodeCast(episode.id);
      const castNames = [...cast.hosts, ...cast.cohosts].map((p) => p.name);
      const participantNames = getParticipantsForEpisode(episode.id).map((p) => p.name);
      return {
        episode,
        year: episode.date.slice(0, 4),
        castNames,
        products,
        mentionCount: mentions.length,
        searchText: normalize([episode.title, ...castNames, ...participantNames, ...products.map((p) => p.name)].join(" ")),
      };
    });
}

function EpisodeRow({ row }: { row: EpisodeRowData }) {
  const { episode, castNames, products, mentionCount } = row;
  const shown = products.slice(0, MAX_LIST_PRODUCTS);
  const rest = products.length - shown.length;
  return (
    <li
      className="relative grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-1 border-b px-2 py-5 transition-colors hover:bg-highlight sm:grid-cols-[6rem_1fr_auto] sm:gap-x-6 sm:px-4"
      data-testid={`card-episode-${episode.id}`}
    >
      <p className="row-span-2 text-2xl font-extrabold leading-tight tracking-[-0.035em] tabular-nums text-muted-foreground sm:row-span-1 sm:text-3xl">
        #{episode.id}
      </p>
      <div className="min-w-0 space-y-1.5">
        <h3 className="text-lg font-bold leading-snug tracking-[-0.01em] text-balance">
          <Link
            href={`/episodes/${episode.id}`}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
            onClick={() => posthog.capture("episode_viewed", { episode_id: episode.id, episode_date: episode.date })}
          >
            {episode.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatShortDate(episode.date)}
          {castNames.length > 0 && <> · com {joinNames(castNames)}</>}
        </p>
        {shown.length > 0 && (
          <p className="text-sm">
            {shown.map((product, i) => (
              <span key={product.id}>
                {i > 0 && <span className="text-muted-foreground" aria-hidden="true"> · </span>}
                <Link href={`/products/${product.id}`} className="relative z-10 font-semibold underline-offset-2 hover:underline">
                  {product.name}
                </Link>
              </span>
            ))}
            {rest > 0 && <span className="text-muted-foreground"> · +{rest}</span>}
          </p>
        )}
      </div>
      <p className="col-start-2 text-sm text-muted-foreground sm:col-start-3 sm:pt-1.5 sm:text-right">
        {mentionCount} {mentionCount === 1 ? "menção" : "menções"}
      </p>
    </li>
  );
}

function EpisodeList() {
  const rows = useMemo(buildEpisodeRows, []);
  const years = useMemo(() => Array.from(new Set(rows.map((r) => r.year))), [rows]);
  const [selectedYear, setSelectedYear] = useState<string>("Todos");
  const [search, setSearch] = useState("");

  const query = normalize(search.trim());
  const filtered = rows.filter(
    (r) => (selectedYear === "Todos" || r.year === selectedYear) && (!query || r.searchText.includes(query))
  );
  const groups = years
    .map((year) => ({ year, rows: filtered.filter((r) => r.year === year) }))
    .filter((g) => g.rows.length > 0);
  const isFiltering = selectedYear !== "Todos" || query.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title" data-testid="text-page-title">Episódios<span className="text-primary" aria-hidden="true">.</span></h1>
        <p className="page-lead">
          {isFiltering ? `${filtered.length} de ${episodes.length} episódios` : `${episodes.length} episódios do podcast`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Buscar por título, pessoa ou produto"
            aria-label="Buscar episódios"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (e.target.value.length > 2) posthog.capture("episode_searched", { query: e.target.value }); }}
            className="h-12 pl-9"
            data-testid="input-search"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["Todos", ...years].map((year) => (
            <Button
              key={year}
              variant={selectedYear === year ? "default" : "outline"}
              size="sm"
              aria-pressed={selectedYear === year}
              onClick={() => { setSelectedYear(year); posthog.capture("episode_year_filtered", { year }); }}
              data-testid={`button-filter-${year.toLowerCase()}`}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="border-y py-12 text-center">
          <p className="text-muted-foreground">Nenhum episódio encontrado{query && <> para “{search.trim()}”</>}.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setSelectedYear("Todos"); }}>
            Limpar busca
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.year} aria-labelledby={`year-${group.year}`}>
              <div className="flex items-baseline gap-3 border-b pb-3">
                <h2 id={`year-${group.year}`} className="text-2xl font-extrabold tracking-[-0.03em]">{group.year}</h2>
                <span className="text-sm text-muted-foreground">
                  {group.rows.length} {group.rows.length === 1 ? "episódio" : "episódios"}
                </span>
              </div>
              <ul>
                {group.rows.map((row) => (
                  <EpisodeRow key={row.episode.id} row={row} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ParticipantRow({ person, products }: {
  person: { id: string; name: string };
  products: { mention: { id: string; context?: string; productId: string }; product: ReturnType<typeof getProduct> }[];
}) {
  return (
    <div key={person.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <Link href={`/people/${person.id}`} className="text-sm font-medium hover:underline shrink-0" data-testid={`badge-person-${person.id}`}>
        {person.name}
      </Link>
      <div className="flex flex-wrap gap-1">
        {products.map(({ mention, product }) =>
          product?.alsoCredits?.length ? (
            <span key={mention.id} className="flex items-center gap-0.5">
              <span className="text-xs text-muted-foreground italic mr-0.5">combo</span>
              {product.alsoCredits.map((id, i) => (
                <span key={id} className="flex items-center gap-0.5">
                  {i > 0 && <span className="text-xs text-muted-foreground">+</span>}
                  <Link href={`/products/${resolveParent(id)}`}>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent border-dashed">
                      {getProduct(id)?.name || id}
                    </Badge>
                  </Link>
                </span>
              ))}
              {mention.context && <span className="text-xs text-muted-foreground italic ml-0.5">({mention.context})</span>}
            </span>
          ) : (
            <span key={mention.id} className="flex items-center gap-1">
              <Link href={`/products/${resolveParent(mention.productId)}`}>
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                  {product?.name || mention.productId}
                </Badge>
              </Link>
              {mention.context && <span className="text-xs text-muted-foreground italic">({mention.context})</span>}
            </span>
          )
        )}
      </div>
    </div>
  );
}

function EpisodeDetail() {
  const { id } = useParams<{ id: string }>();
  const episodeId = parseInt(id!);
  const episode = episodes.find((e) => e.id === episodeId);

  if (!episode) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Episódio não encontrado.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/episodes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
    );
  }

  const epMentions = getMentionsForEpisode(episodeId);
  const participants = getParticipantsForEpisode(episodeId);

  const productMentionCounts = epMentions.reduce((acc, m) => {
    const resolvedId = resolveParent(m.productId);
    acc.set(resolvedId, (acc.get(resolvedId) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  const sortedEpisodeProducts = Array.from(productMentionCounts.entries())
    .map(([productId, count]) => ({ productId, count, product: getProduct(productId) }))
    .filter(({ product }) => !product?.alsoCredits?.length)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return (a.product?.name || a.productId).localeCompare(b.product?.name || b.productId);
    });

  const cast = getEpisodeCast(episode.id);
  const castIds = new Set([...cast.hosts, ...cast.cohosts].map((p) => p.id));

  const rowFor = (person: { id: string; name: string }) => ({
    person,
    products: epMentions.filter((m) => m.personId === person.id).map((m) => ({
      mention: m,
      product: getProduct(m.productId),
    })),
  });

  const hosts = cast.hosts.map(rowFor);
  const cohosts = cast.cohosts.map(rowFor);
  const community = participants
    .filter((p) => !castIds.has(p.id))
    .sort((a, b) => a.name.localeCompare(b.name, "pt"))
    .map(rowFor);
  const castPeople = [...cast.hosts, ...cast.cohosts];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 text-muted-foreground" data-testid="button-back">
          <Link href="/episodes">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Episódios
          </Link>
        </Button>
        <p className="mb-2 text-sm text-muted-foreground" data-testid="text-episode-date">
          <span className="font-semibold text-foreground">#{episode.id}</span> · {formatLongDate(episode.date)}
        </p>
        <h1 className="detail-title" data-testid="text-episode-title">
          {episode.title}
        </h1>
        {castPeople.length > 0 && (
          <p className="text-sm mt-2" data-testid="text-episode-cast">
            <span className="text-muted-foreground">Com </span>
            {castPeople.map((person, i) => (
              <span key={person.id}>
                {i > 0 && <span className="text-muted-foreground">{i === castPeople.length - 1 ? " e " : ", "}</span>}
                <Link href={`/people/${person.id}`} className="font-medium hover:underline">{person.name}</Link>
              </span>
            ))}
          </p>
        )}
        {(episode.youtubeLink || episode.spotifyLink) && (
          <div className="mt-5 flex flex-wrap gap-3">
            {episode.youtubeLink && (
              <a
                href={episode.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border bg-card px-5 text-sm font-semibold outline-none transition-colors hover:bg-highlight focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => posthog.capture("episode_external_link_clicked", { episode_id: episode.id, platform: "youtube" })}
                data-testid="link-youtube"
              >
                <SiYoutube aria-hidden="true" className="h-4 w-4 text-brand-youtube" /> Assistir no YouTube
              </a>
            )}
            {episode.spotifyLink && (
              <a
                href={episode.spotifyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border bg-card px-5 text-sm font-semibold outline-none transition-colors hover:bg-highlight focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => posthog.capture("episode_external_link_clicked", { episode_id: episode.id, platform: "spotify" })}
                data-testid="link-spotify"
              >
                <SiSpotify aria-hidden="true" className="h-4 w-4 text-brand-spotify" /> Ouvir no Spotify
              </a>
            )}
          </div>
        )}
      </div>

      <StatBand
        className="grid-cols-3"
        items={[
          { label: "Menções", value: epMentions.length },
          { label: "Produtos", value: sortedEpisodeProducts.length },
          { label: "Pessoas", value: participants.length },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Produtos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Produtos mencionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0.5">
              {sortedEpisodeProducts.map(({ productId, count, product }, index) => (
                <div key={productId} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs text-muted-foreground w-5 text-right shrink-0 tabular-nums">{index + 1}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <Link href={`/products/${productId}`} className="text-sm font-medium hover:underline">
                        {product?.name || productId}
                      </Link>
                      {product?.category && (
                        <span className="text-xs text-muted-foreground shrink-0">{product.category}</span>
                      )}
                    </div>
                  </div>
                  {count > 1 && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 shrink-0 ml-2">
                      {count}×
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Participantes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Participantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Hosts", rows: hosts },
                { label: "Cohosts", rows: cohosts },
                { label: "Comunidade", rows: community },
              ]
                .filter(({ rows }) => rows.length > 0)
                .map(({ label, rows }, index) => (
                  <div key={label}>
                    {index > 0 && <div className="border-t border-border/50 mb-3" />}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
                    <div className="space-y-2.5">
                      {rows.map(({ person, products }) => (
                        <ParticipantRow key={person.id} person={person} products={products} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function EpisodesPage() {
  const params = useParams<{ id: string }>();
  if (params.id) return <EpisodeDetail />;
  return <EpisodeList />;
}
