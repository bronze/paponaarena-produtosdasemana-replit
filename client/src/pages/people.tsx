import { categoryLabel } from "@/lib/categories";
import {Link, useParams} from "wouter";
import {ArrowLeft, Package, Mic, Search} from "lucide-react";
import { posthog } from "@/lib/analytics";
import {SiLinkedin} from "react-icons/si";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { StatBand } from "@/components/stat-band";
import { LoadMore, ShowAllButton } from "@/components/ranking";
import type { Mention } from "@/lib/types";
import {Avatar, AvatarImage, AvatarFallback} from "@/components/ui/avatar";
import {useState, useMemo, useRef} from "react";
import {people, getMentionsForPerson, getProduct, getEpisode, getPersonRoleCounts} from "@/lib/data-utils";
import { normalize } from "@/lib/text";
import arthurImg from "@assets/arthur_1772132984125.webp";
import aquisImg from "@assets/aiquis_1772132984122.webp";
import arthurAudio from "@assets/audio/audio-arthur.mp3";
import aquisAudio from "@assets/audio/audio-aiquis.mp3";
import aquisCaraAudio from "@assets/audio/audio-aiquis-cara.mp3";

const hostAvatars: Record<string, string> = {
  arthur: arthurImg,
  aiquis: aquisImg,
};

type PeopleSortMode = "mentions" | "alpha";

const MAX_LIST_PRODUCTS = 4;
const INITIAL_COUNT = 30;
const LOAD_MORE_COUNT = 100;

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type PersonRowData = {
  id: string;
  name: string;
  rank: number;
  isHost: boolean;
  mentionCount: number;
  episodeCount: number;
  products: { id: string; name: string }[];
  searchText: string;
};

function buildPersonRows(): PersonRowData[] {
  return people
    .map((p) => {
      const m = getMentionsForPerson(p.id);
      const counts = new Map<string, number>();
      for (const x of m) counts.set(x.productId, (counts.get(x.productId) || 0) + 1);
      const products = Array.from(counts.entries())
        .map(([id, count]) => ({ id, count, name: getProduct(id)?.name || id }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"))
        .map(({ id, name }) => ({ id, name }));
      return {
        id: p.id,
        name: p.name,
        rank: 0,
        isHost: getPersonRoleCounts(p.id).host > 0,
        mentionCount: m.length,
        episodeCount: new Set(m.map((x) => x.episodeId)).size,
        products,
        searchText: normalize([p.name, ...products.map((x) => x.name)].join(" ")),
      };
    })
    .filter((p) => p.mentionCount > 0)
    .sort((a, b) => b.mentionCount - a.mentionCount || a.name.localeCompare(b.name, "pt-BR"))
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

function PersonRow({ row, query }: { row: PersonRowData; query: string }) {
  // Na busca por produto, os produtos que batem aparecem primeiro
  const ordered = query
    ? [...row.products].sort((a, b) => Number(normalize(b.name).includes(query)) - Number(normalize(a.name).includes(query)))
    : row.products;
  const shown = ordered.slice(0, MAX_LIST_PRODUCTS);
  const rest = row.products.length - shown.length;
  return (
    <li
      className="relative grid grid-cols-[2rem_3rem_1fr] items-start gap-x-3 gap-y-1 border-b px-2 py-4 transition-colors hover:bg-highlight sm:grid-cols-[2.5rem_3rem_1fr_auto] sm:gap-x-4 sm:px-4"
      data-testid={`card-person-${row.id}`}
    >
      <span className="pt-3 text-right text-sm font-bold tabular-nums text-muted-foreground">{row.rank}</span>
      <Avatar className="h-12 w-12">
        {hostAvatars[row.id] ? <AvatarImage src={hostAvatars[row.id]} alt="" /> : null}
        <AvatarFallback className="text-sm font-semibold">{initials(row.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 space-y-1">
        <h2 className="text-lg font-bold leading-snug tracking-[-0.01em]">
          <Link
            href={`/people/${row.id}`}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
            onClick={() => posthog.capture("person_viewed", { person_id: row.id, source: "list" })}
          >
            {row.name}
          </Link>
        </h2>
        <p className="text-sm text-muted-foreground" data-testid={`text-episodes-${row.id}`}>
          {row.isHost && <><span className="font-semibold text-foreground">Host</span> · </>}
          em {row.episodeCount} {row.episodeCount === 1 ? "episódio" : "episódios"}
        </p>
        {shown.length > 0 && (
          <p className="text-sm" data-testid={`text-products-${row.id}`}>
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
        <p className="text-sm text-muted-foreground sm:hidden">
          {row.mentionCount} {row.mentionCount === 1 ? "menção" : "menções"}
        </p>
      </div>
      <p className="hidden pt-1 text-right text-sm text-muted-foreground sm:block" data-testid={`text-mentions-${row.id}`}>
        {row.mentionCount} {row.mentionCount === 1 ? "menção" : "menções"}
      </p>
    </li>
  );
}

function PeopleList() {
  const rows = useMemo(buildPersonRows, []);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<PeopleSortMode>("mentions");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const query = normalize(search.trim());
  const filtered = useMemo(() => {
    const list = query ? rows.filter((r) => r.searchText.includes(query)) : rows;
    return sortMode === "alpha" ? [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")) : list;
  }, [rows, query, sortMode]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title" data-testid="text-page-title">
          Pessoas<span className="text-primary" aria-hidden="true">.</span>
        </h1>
        <p className="page-lead">
          {query ? `${filtered.length} de ${rows.length} pessoas` : `${rows.length} pessoas que já recomendaram produtos no podcast`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Buscar por pessoa ou produto"
            aria-label="Buscar pessoas"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(INITIAL_COUNT); if (e.target.value.length > 2) posthog.capture("person_searched", { query: e.target.value }); }}
            className="h-12 pl-9"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2">
          {([["mentions", "Mais menções"], ["alpha", "Alfabética"]] as const).map(([mode, label]) => (
            <Button
              key={mode}
              variant={sortMode === mode ? "default" : "outline"}
              size="sm"
              aria-pressed={sortMode === mode}
              onClick={() => { setSortMode(mode); setVisibleCount(INITIAL_COUNT); posthog.capture("people_sort_changed", { sort_mode: mode }); }}
              data-testid={`sort-${mode}`}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border-y py-12 text-center">
          <p className="text-muted-foreground">Nenhuma pessoa encontrada para “{search.trim()}”.</p>
          <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
            Limpar busca
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <ul className="border-t">
            {filtered.slice(0, visibleCount).map((row) => (
              <PersonRow key={row.id} row={row} query={query} />
            ))}
          </ul>
          <LoadMore
            visible={visibleCount}
            total={filtered.length}
            step={LOAD_MORE_COUNT}
            noun={{ all: "Mostrar todas", lastOne: "a última pessoa", lastMany: "as últimas" }}
            onShow={(next, mode) => {
              setVisibleCount(next);
              posthog.capture("people_list_expanded", { mode, visible_count: next, total: filtered.length });
            }}
          />
        </div>
      )}
    </div>
  );
}

const DETAIL_LIST_LIMIT = 20;

/** Produto citado numa menção: nome com link, combos como "A + B (combo)" e o comentário, se houver. */
function MentionedProduct({ mention }: { mention: Mention }) {
  const product = getProduct(mention.productId);
  const credits = product?.alsoCredits;
  return (
    <span>
      {credits?.length ? (
        <>
          {credits.map((creditId, idx) => (
            <span key={creditId}>
              {idx > 0 && <span className="text-muted-foreground"> + </span>}
              <Link href={`/products/${creditId}`} className="font-semibold underline-offset-2 hover:underline">
                {getProduct(creditId)?.name || creditId}
              </Link>
            </span>
          ))}
          <span className="text-muted-foreground"> (combo)</span>
        </>
      ) : (
        <Link href={`/products/${mention.productId}`} className="font-semibold underline-offset-2 hover:underline">
          {product?.name || mention.productId}
        </Link>
      )}
      {mention.context && <span className="italic text-muted-foreground"> — {mention.context}</span>}
    </span>
  );
}


function PersonDetail() {
  const {id} = useParams<{id: string}>();
  const person = people.find((p) => p.id === id);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  if (!person) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Pessoa não encontrada.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/people">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
    );
  }

  const audioSrc = person.id === "arthur" ? arthurAudio : person.id === "aiquis" ? aquisAudio : null;

  const playSound = () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (person.id === "aiquis") {
      const aquisAudios = [aquisAudio, aquisCaraAudio];
      audio.src = aquisAudios[Math.floor(Math.random() * aquisAudios.length)];
    }
    const wasEnded = audio.ended;
    audio.pause();
    audio.currentTime = 0;
    if (wasEnded) audio.load();
    audio.play().catch(() => {});
  };

  const personMentions = getMentionsForPerson(person.id);

  const productCounts = new Map<string, number>();
  for (const m of personMentions) {
    productCounts.set(m.productId, (productCounts.get(m.productId) || 0) + 1);
  }
  const topProducts = Array.from(productCounts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return (getProduct(a[0])?.name || a[0]).localeCompare(getProduct(b[0])?.name || b[0], "pt-BR");
  });

  const episodeIds = Array.from(new Set(personMentions.map((m) => m.episodeId))).sort((a, b) => b - a);

  const roles = getPersonRoleCounts(person.id);
  const epLabel = (n: number) => `${n} ${n === 1 ? "episódio" : "episódios"}`;
  const roleLine = [
    roles.host > 0 && `Host em ${epLabel(roles.host)}`,
    roles.cohost > 0 && `Cohost em ${epLabel(roles.cohost)}`,
  ].filter(Boolean).join(" · ");

  const shownProducts = showAllProducts ? topProducts : topProducts.slice(0, DETAIL_LIST_LIMIT);
  const shownEpisodes = showAllEpisodes ? episodeIds : episodeIds.slice(0, DETAIL_LIST_LIMIT);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 text-muted-foreground" data-testid="button-back">
          <Link href="/people">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Pessoas
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <Avatar
            className={`h-16 w-16 shrink-0 md:h-20 md:w-20 ${audioSrc ? "select-none active:scale-95 transition-transform cursor-pointer" : ""}`}
            onPointerUp={audioSrc ? playSound : undefined}
            style={{ touchAction: "manipulation" }}>
            {hostAvatars[person.id] ? <AvatarImage src={hostAvatars[person.id]} alt={person.name} /> : null}
            <AvatarFallback className="text-lg font-semibold">{initials(person.name)}</AvatarFallback>
          </Avatar>
          {audioSrc && <audio ref={audioRef} src={audioSrc} preload="auto" playsInline />}
          <div className="min-w-0">
            <h1 className="detail-title" data-testid="text-person-name">
              {person.name}
            </h1>
            {roleLine && <p className="mt-1 text-sm text-muted-foreground" data-testid="text-person-roles">{roleLine}</p>}
          </div>
        </div>
        {person.linkedinUrl && (
          <a
            href={person.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-12 items-center gap-2 rounded-full border bg-card px-5 text-sm font-semibold outline-none transition-colors hover:bg-highlight focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => posthog.capture("person_linkedin_clicked", { person_id: person.id })}
            data-testid="link-linkedin"
          >
            <SiLinkedin aria-hidden="true" className="h-4 w-4 text-brand-linkedin" /> Ver no LinkedIn
          </a>
        )}
      </div>

      <StatBand
        className="grid-cols-3"
        items={[
          { label: "Menções", value: personMentions.length },
          { label: "Produtos", value: topProducts.length },
          { label: "Episódios", value: episodeIds.length },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Produtos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Produtos recomendados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol>
              {shownProducts.map(([productId, count], index) => {
                const product = getProduct(productId);
                return (
                  <li key={productId} className="flex items-center justify-between gap-3 border-b border-border/40 py-2 last:border-0">
                    <div className="flex min-w-0 items-baseline gap-2.5">
                      <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{index + 1}</span>
                      <Link href={`/products/${productId}`} className="text-sm font-medium hover:underline">
                        {product?.name || productId}
                      </Link>
                      {product?.category && <span className="shrink-0 text-xs text-muted-foreground">{categoryLabel(product.category)}</span>}
                    </div>
                    {count > 1 && (
                      <span className="ml-2 shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{count}×</span>
                    )}
                  </li>
                );
              })}
            </ol>
            {!showAllProducts && topProducts.length > DETAIL_LIST_LIMIT && (
              <ShowAllButton total={topProducts.length} onClick={() => setShowAllProducts(true)} />
            )}
          </CardContent>
        </Card>

        {/* Episódios */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mic className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Episódios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {shownEpisodes.map((epId) => {
                const episode = getEpisode(epId);
                const epMentions = personMentions.filter((m) => m.episodeId === epId);
                return (
                  <li key={epId} className="space-y-1 border-b border-border/40 py-3 first:pt-0 last:border-0">
                    <Link href={`/episodes/${epId}`} className="block text-sm font-medium leading-snug hover:underline">
                      <span className="font-bold tabular-nums">#{epId}</span>
                      {episode && <span className="text-muted-foreground"> · </span>}
                      {episode?.title}
                    </Link>
                    <p className="text-sm">
                      {epMentions.map((m, i) => (
                        <span key={m.id}>
                          {i > 0 && <span className="text-muted-foreground" aria-hidden="true"> · </span>}
                          <MentionedProduct mention={m} />
                        </span>
                      ))}
                    </p>
                  </li>
                );
              })}
            </ul>
            {!showAllEpisodes && episodeIds.length > DETAIL_LIST_LIMIT && (
              <ShowAllButton total={episodeIds.length} onClick={() => setShowAllEpisodes(true)} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PeoplePage() {
  const params = useParams<{id: string}>();
  if (params.id) return <PersonDetail key={params.id} />;
  return <PeopleList />;
}
