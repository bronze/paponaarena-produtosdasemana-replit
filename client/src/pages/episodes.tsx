import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ExternalLink, Mic, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  episodes,
  getMentionsForEpisode,
  getProduct,
  getPerson,
  getParticipantsForEpisode,
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

      <div className="grid gap-3">
        {filtered.map((ep) => {
          const mentionCount = getMentionsForEpisode(ep.id).length;
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
                      <span className="text-xs text-muted-foreground">{ep.date}</span>
                    </div>
                    <h3 className="font-medium text-sm leading-snug mb-1">{ep.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{ep.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mic className="h-3 w-3" />
                      <span>{mentionCount} menções</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{participants.length}</span>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/episodes">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">#{episode.id}</Badge>
            <span className="text-sm text-muted-foreground">{episode.date}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1" data-testid="text-episode-title">{episode.title}</h1>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{episode.description}</p>

      <div className="flex gap-2">
        {episode.youtubeLink && (
          <a href={episode.youtubeLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" data-testid="link-youtube">
              <ExternalLink className="mr-1 h-3 w-3" /> YouTube
            </Button>
          </a>
        )}
        {episode.spotifyLink && (
          <a href={episode.spotifyLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" data-testid="link-spotify">
              <ExternalLink className="mr-1 h-3 w-3" /> Spotify
            </Button>
          </a>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menções ({epMentions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {epMentions.map((m) => {
                const product = getProduct(m.productId);
                const person = getPerson(m.personId);
                return (
                  <div key={m.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0" data-testid={`mention-${m.id}`}>
                    <div>
                      <Link href={`/products/${m.productId}`} className="text-sm font-medium hover:underline">
                        {product?.name || m.productId}
                      </Link>
                      {m.context && <span className="text-xs text-muted-foreground ml-2">({m.context})</span>}
                    </div>
                    <Link href={`/people/${m.personId}`} className="text-xs text-muted-foreground hover:underline shrink-0">
                      {person?.name || m.personId}
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Participantes ({participants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => p && (
                <Link key={p.id} href={`/people/${p.id}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent" data-testid={`badge-person-${p.id}`}>
                    {p.name}
                  </Badge>
                </Link>
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
