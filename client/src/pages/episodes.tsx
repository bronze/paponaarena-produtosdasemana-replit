import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Mic, Package, Users } from "lucide-react";
import { SiYoutube, SiSpotify } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  episodes,
  getMentionsForEpisode,
  getProduct,
  getParticipantsForEpisode,
  resolveParent,
} from "@/lib/data-utils";

const YEAR_FILTERS = ["Todos", "2026", "2025", "2024"] as const;

function EpisodeList() {
  const [selectedYear, setSelectedYear] = useState<string>("Todos");
  const sorted = [...episodes].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = selectedYear === "Todos"
    ? sorted
    : sorted.filter((ep) => ep.date.startsWith(selectedYear));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Episódios</h1>
        <p className="text-muted-foreground">
          {selectedYear === "Todos"
            ? `${episodes.length} episódios do podcast`
            : `${filtered.length} de ${episodes.length} episódios`}
        </p>
      </div>

      <div className="flex gap-2">
        {YEAR_FILTERS.map((year) => (
          <Button
            key={year}
            variant={selectedYear === year ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedYear(year)}
            data-testid={`button-filter-${year.toLowerCase()}`}
          >
            {year}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((ep) => {
          const mentions = getMentionsForEpisode(ep.id);
          const mentionCount = mentions.length;
          const uniqueProductCount = new Set(mentions.map((m) => m.productId)).size;
          const participants = getParticipantsForEpisode(ep.id);
          return (
            <Link key={ep.id} href={`/episodes/${ep.id}`}>
              <div
                className="p-4 rounded-lg border border-border/60 bg-card transition-colors hover:bg-accent/50 cursor-pointer"
                data-testid={`card-episode-${ep.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="shrink-0 text-xs">#{ep.id}</Badge>
                      <span className="text-sm text-muted-foreground">{ep.date}</span>
                    </div>
                    <h3 className="font-medium text-sm leading-snug mb-1">{ep.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{ep.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mic className="h-3.5 w-3.5" />
                      <span>{mentionCount} menções</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      <span>{uniqueProductCount} produtos</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{participants.length} pessoas</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
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
        <Link href="/episodes">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>
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

  const HOSTS = episode.hosts ?? ["aiquis", "arthur"];
  const sortedParticipants = [...participants].sort((a, b) => {
    const aHost = HOSTS.indexOf(a.id);
    const bHost = HOSTS.indexOf(b.id);
    if (aHost !== -1 || bHost !== -1) return (aHost === -1 ? 99 : aHost) - (bHost === -1 ? 99 : bHost);
    return a.name.localeCompare(b.name, "pt");
  });

  const participantWithProducts = sortedParticipants.map((p) => ({
    person: p,
    products: epMentions.filter((m) => m.personId === p.id).map((m) => ({
      mention: m,
      product: getProduct(m.productId),
    })),
  }));

  const hosts = participantWithProducts.filter(({ person }) => HOSTS.includes(person.id));
  const guests = participantWithProducts.filter(({ person }) => !HOSTS.includes(person.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/episodes">
          <Button variant="ghost" size="sm" className="mb-3 -ml-2 text-muted-foreground" data-testid="button-back">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Episódios
          </Button>
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-sm px-2.5 py-0.5">#{episode.id}</Badge>
          <span className="text-sm text-muted-foreground">{episode.date}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight leading-snug" data-testid="text-episode-title">
          {episode.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{episode.description}</p>
      </div>

      {/* Stats + Links */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{epMentions.length}</p>
            <p className="text-xs text-muted-foreground">menções</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold">{sortedEpisodeProducts.length}</p>
            <p className="text-xs text-muted-foreground">produtos</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold">{participants.length}</p>
            <p className="text-xs text-muted-foreground">pessoas</p>
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          {episode.youtubeLink && (
            <a href={episode.youtubeLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-[#FF0000]/40 text-[#FF0000] hover:bg-[#FF0000]/10" data-testid="link-youtube">
                <SiYoutube className="mr-1.5 h-3.5 w-3.5" /> YouTube
              </Button>
            </a>
          )}
          {episode.spotifyLink && (
            <a href={episode.spotifyLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-[#1DB954]/40 text-[#1DB954] hover:bg-[#1DB954]/10" data-testid="link-spotify">
                <SiSpotify className="mr-1.5 h-3.5 w-3.5" /> Spotify
              </Button>
            </a>
          )}
        </div>
      </div>

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
              {hosts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Hosts</p>
                  <div className="space-y-2.5">
                    {hosts.map(({ person, products }) => (
                      <ParticipantRow key={person.id} person={person} products={products} />
                    ))}
                  </div>
                </div>
              )}
              {guests.length > 0 && (
                <div>
                  {hosts.length > 0 && <div className="border-t border-border/50 mb-3" />}
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Comunidade</p>
                  <div className="space-y-2.5">
                    {guests.map(({ person, products }) => (
                      <ParticipantRow key={person.id} person={person} products={products} />
                    ))}
                  </div>
                </div>
              )}
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
