import { Link, useParams } from "wouter";
import { ArrowLeft, User, Package, Mic, TrendingUp } from "lucide-react";
import { SiLinkedin } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useMemo } from "react";
import {
  people,
  episodes,
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

type PeopleSortMode = "mentions" | "alpha";

function PeopleList() {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<PeopleSortMode>("mentions");

  const totalEpisodes = episodes.length;

  const allPeople = useMemo(() => {
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
      .filter((p) => p.mentionCount > 0);
  }, []);

  const filtered = useMemo(() => {
    let list = allPeople;
    if (search) {
      list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (sortMode === "alpha") {
      return [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    }
    return [...list].sort((a, b) => b.mentionCount - a.mentionCount);
  }, [allPeople, search, sortMode]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Pessoas</h1>
        <p className="text-muted-foreground">{allPeople.length} participantes do podcast</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Input
          placeholder="Buscar pessoa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          data-testid="input-search"
        />
        <div className="flex gap-1">
          <Button
            variant={sortMode === "mentions" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortMode("mentions")}
            data-testid="sort-mentions"
          >
            Mais menções
          </Button>
          <Button
            variant={sortMode === "alpha" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortMode("alpha")}
            data-testid="sort-alpha"
          >
            Alfabética
          </Button>
        </div>
      </div>

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
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1" data-testid={`text-products-${person.id}`}>
                    <Package className="h-3 w-3" /> {person.productCount} produtos
                  </span>
                  <span className="flex items-center gap-1" data-testid={`text-episodes-${person.id}`}>
                    <Mic className="h-3 w-3" /> {person.episodeCount} / {totalEpisodes} eps
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <span className="text-lg font-bold" data-testid={`text-mentions-${person.id}`}>{person.mentionCount}</span>
                <span className="text-xs text-muted-foreground leading-tight">menções</span>
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

  const statCards = [
    { label: "Total de Menções", value: personMentions.length, icon: TrendingUp, color: "text-purple-500" },
    { label: "Produtos Únicos", value: topProducts.length, icon: Package, color: "text-green-500" },
    { label: "Episódios", value: episodesParticipated.size, icon: Mic, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/people">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Avatar className="h-12 w-12 shrink-0">
          {hostAvatars[person.id] ? (
            <AvatarImage src={hostAvatars[person.id]} alt={person.name} />
          ) : null}
          <AvatarFallback className="text-sm font-semibold">
            {person.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-person-name">{person.name}</h1>
          <p className="text-sm text-muted-foreground">Análise do participante</p>
          {person.linkedinUrl && (
            <a href={person.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Badge variant="outline" className="mt-2 cursor-pointer text-sm px-3 py-1 border-[#0A66C2]/40 text-[#0A66C2] hover:bg-[#0A66C2]/10" data-testid="link-linkedin">
                <SiLinkedin className="mr-1.5 h-4 w-4" /> LinkedIn
              </Badge>
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
            <div className="space-y-3">
              {Array.from(episodesParticipated)
                .sort((a, b) => b - a)
                .map((epId) => {
                  const epMentions = personMentions.filter((m) => m.episodeId === epId);
                  return (
                    <div key={epId} className="flex items-center gap-2 flex-wrap py-2 border-b border-border/50 last:border-0 -mx-2 px-2 rounded">
                      <Link href={`/episodes/${epId}`}>
                        <Badge variant="outline" className="text-xs shrink-0 cursor-pointer hover:bg-accent">#{epId}</Badge>
                      </Link>
                      {epMentions.map((m) => {
                        const product = getProduct(m.productId);
                        const isCombo = product?.alsoCredits && product.alsoCredits.length > 0;
                        if (isCombo) {
                          const credits = product!.alsoCredits!;
                          return (
                            <span key={m.id} className="inline-flex items-center gap-1.5">
                              {credits.map((creditId, idx) => {
                                const credited = getProduct(creditId);
                                return (
                                  <span key={creditId} className="inline-flex items-center gap-1.5">
                                    {idx > 0 && <span className="text-xs text-muted-foreground">+</span>}
                                    <Link href={`/products/${creditId}`}>
                                      <Badge variant="secondary" className="text-xs font-normal cursor-pointer hover:bg-accent">
                                        {credited?.name || creditId}
                                      </Badge>
                                    </Link>
                                  </span>
                                );
                              })}
                              <Badge variant="outline" className="text-xs font-normal text-muted-foreground">combo</Badge>
                            </span>
                          );
                        }
                        return (
                          <Link key={m.id} href={`/products/${m.productId}`}>
                            <Badge variant="secondary" className="text-xs font-normal cursor-pointer hover:bg-accent">
                              {product?.name || m.productId}
                            </Badge>
                          </Link>
                        );
                      })}
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

export default function PeoplePage() {
  const params = useParams<{ id: string }>();
  if (params.id) return <PersonDetail />;
  return <PeopleList />;
}
