import { Link, useParams } from "wouter";
import { ArrowLeft, ExternalLink, User, Package, Mic } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useMemo } from "react";
import {
  people,
  getMentionsForPerson,
  getProduct,
  getEpisode,
  getPersonMentionCount,
} from "@/lib/data-utils";
import arthurImg from "@assets/arthur_1772132984125.png";
import aquisImg from "@assets/aiquis_1772132984122.png";

const hostAvatars: Record<string, string> = {
  arthur: arthurImg,
  aiquis: aquisImg,
};

function PeopleList() {
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    return [...people]
      .map((p) => {
        const m = getMentionsForPerson(p.id);
        const uniqueProducts = new Set(m.map((x) => x.productId));
        const uniqueEpisodes = new Set(m.map((x) => x.episodeId));
        return {
          ...p,
          mentionCount: m.length,
          productCount: uniqueProducts.size,
          episodeCount: uniqueEpisodes.size,
        };
      })
      .filter((p) => p.mentionCount > 0)
      .sort((a, b) => b.mentionCount - a.mentionCount);
  }, []);

  const filtered = search
    ? sorted.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : sorted;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Pessoas</h1>
        <p className="text-muted-foreground">{sorted.length} participantes do podcast</p>
      </div>

      <Input
        placeholder="Buscar pessoa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
        data-testid="input-search"
      />

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((person, i) => (
          <Link key={person.id} href={`/people/${person.id}`}>
            <div
              className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card transition-colors hover:bg-accent/50 cursor-pointer"
              data-testid={`card-person-${person.id}`}
            >
              <span className="text-lg font-bold text-muted-foreground w-8 text-right shrink-0">{i + 1}</span>
              <Avatar className="h-12 w-12 shrink-0">
                {hostAvatars[person.id] ? (
                  <AvatarImage src={hostAvatars[person.id]} alt={person.name} />
                ) : null}
                <AvatarFallback className="text-sm font-semibold">
                  {person.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{person.name}</span>
                  {(person.id === "arthur" || person.id === "aiquis") && (
                    <Badge variant="secondary" className="text-xs shrink-0">Host</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1" data-testid={`text-products-${person.id}`}>
                    <Package className="h-3 w-3" /> {person.productCount} produtos
                  </span>
                  <span className="flex items-center gap-1" data-testid={`text-episodes-${person.id}`}>
                    <Mic className="h-3 w-3" /> {person.episodeCount} eps
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Nenhuma pessoa encontrada.</p>
      )}
    </div>
  );
}

function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const person = people.find((p) => p.id === id);

  if (!person) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Pessoa não encontrada.</p>
        <Link href="/people">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const personMentions = getMentionsForPerson(person.id);

  const productCounts = new Map<string, number>();
  for (const m of personMentions) {
    productCounts.set(m.productId, (productCounts.get(m.productId) || 0) + 1);
  }
  const topProducts = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1]);

  const episodesParticipated = new Set(personMentions.map((m) => m.episodeId));

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2">
        <Link href="/people">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-person-name">{person.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {(person.id === "arthur" || person.id === "aiquis") && (
              <Badge variant="secondary">Host</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {personMentions.length} menções em {episodesParticipated.size} episódios
            </span>
          </div>
        </div>
      </div>

      {person.linkedinUrl && (
        <a href={person.linkedinUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" data-testid="link-linkedin">
            <ExternalLink className="mr-1 h-3 w-3" /> LinkedIn
          </Button>
        </a>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos mencionados ({topProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topProducts.map(([productId, count]) => {
                const product = getProduct(productId);
                return (
                  <div key={productId} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <Link href={`/products/${productId}`} className="text-sm hover:underline">
                      {product?.name || productId}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      {product && <Badge variant="outline" className="text-xs">{product.category}</Badge>}
                      {count > 1 && <span className="text-xs font-semibold text-muted-foreground">{count}x</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Episódios ({episodesParticipated.size})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Array.from(episodesParticipated)
                .sort((a, b) => b - a)
                .map((epId) => {
                  const episode = getEpisode(epId);
                  return (
                    <Link key={epId} href={`/episodes/${epId}`}>
                      <div className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-accent/30 -mx-2 px-2 rounded">
                        <Badge variant="outline" className="text-xs shrink-0">#{epId}</Badge>
                        <span className="text-sm truncate">{episode?.title || `Episódio ${epId}`}</span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PeoplePage() {
  const params = useParams<{ id: string }>();
  if (params.id) return <PersonDetail />;
  return <PeopleList />;
}
