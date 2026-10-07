import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { SiSpotify, SiYoutube } from "react-icons/si";
import { posthog } from "@/lib/analytics";
import type { Episode, Person, Product } from "@/lib/types";
import { formatLongDate as formatDate } from "@/lib/dates";

export type LatestEpisodeVariant = "cinza" | "escuro" | "editorial";

export type LatestEpisodeProps = {
  episode: Episode;
  cast: Person[];
  mentionCount: number;
  products: Product[];
};

const MAX_PRODUCTS = 5;

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

function trackOpen(episode: Episode) {
  posthog.capture("dashboard_latest_episode_clicked", { episode_id: episode.id, episode_title: episode.title });
}

/** Lista "Claude · Codex da OpenAI · +3", com cada produto linkando para a própria página. */
function ProductLinks({ products, className }: { products: Product[]; className: string }) {
  const shown = products.slice(0, MAX_PRODUCTS);
  const rest = products.length - shown.length;
  return (
    <>
      {shown.map((product, i) => (
        <span key={product.id}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          <Link href={`/produtos/${product.id}`} className={className}>
            {product.name}
          </Link>
        </span>
      ))}
      {rest > 0 && <span> · +{rest}</span>}
    </>
  );
}

function PodcastLinks({ episode, className }: { episode: Episode; className: string }) {
  return (
    <>
      {episode.youtubeLink && (
        <a
          href={episode.youtubeLink}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={() => posthog.capture("episode_external_link_clicked", { episode_id: episode.id, platform: "youtube", source: "dashboard" })}
        >
          <SiYoutube aria-hidden="true" className="h-4 w-4" /> YouTube
        </a>
      )}
      {episode.spotifyLink && (
        <a
          href={episode.spotifyLink}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={() => posthog.capture("episode_external_link_clicked", { episode_id: episode.id, platform: "spotify", source: "dashboard" })}
        >
          <SiSpotify aria-hidden="true" className="h-4 w-4" /> Spotify
        </a>
      )}
    </>
  );
}

/** A: bloco cinza de destaque, coral só no botão. */
function LatestEpisodeCinza({ episode, cast, mentionCount, products }: LatestEpisodeProps) {
  return (
    <section className="grid gap-6 rounded-lg bg-highlight p-6 md:grid-cols-[1fr_auto] md:items-end md:p-8" data-testid="card-latest-episode">
      <div className="min-w-0 space-y-3">
        <h2 className="text-2xl font-extrabold leading-tight tracking-[-0.03em] text-balance md:text-3xl" data-testid="text-latest-title">
          <Link href={`/episodios/${episode.id}`} className="underline-offset-4 hover:underline" onClick={() => trackOpen(episode)}>
            {episode.title}
          </Link>
        </h2>
        <p className="text-sm text-muted-foreground">
          Último episódio · #{episode.id} · {formatDate(episode.date)}
          {cast.length > 0 && <> · com {joinNames(cast.map((p) => p.name))}</>}
        </p>
        {products.length > 0 && (
          <p className="text-sm" data-testid="text-latest-products">
            <span className="text-muted-foreground">{mentionCount} menções: </span>
            <ProductLinks products={products} className="font-semibold underline-offset-2 hover:underline" />
          </p>
        )}
      </div>
      <Link
        href={`/episodios/${episode.id}`}
        onClick={() => trackOpen(episode)}
        className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Ver episódio <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

/** B: card escuro, no espírito do card "Papo na Arena" de productarena.io/podcast. */
function LatestEpisodeEscuro({ episode, cast, mentionCount, products }: LatestEpisodeProps) {
  return (
    <section className="relative overflow-hidden rounded-lg bg-sidebar text-sidebar-foreground" data-testid="card-latest-episode">
      <p
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 right-4 select-none text-[6rem] font-extrabold leading-none tracking-[-0.04em] text-primary md:-bottom-6 md:right-8 md:text-[9rem]"
      >
        #{episode.id}
      </p>
      <div className="relative space-y-4 p-6 pb-28 md:p-10 md:pb-10 md:pr-80">
        <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-balance md:text-4xl" data-testid="text-latest-title">
          <Link href={`/episodios/${episode.id}`} className="underline-offset-4 hover:underline" onClick={() => trackOpen(episode)}>
            {episode.title}
          </Link>
        </h2>
        <p className="text-sm text-sidebar-foreground/70">
          Último episódio · {formatDate(episode.date)}
          {cast.length > 0 && <> · com {joinNames(cast.map((p) => p.name))}</>}
        </p>
        {products.length > 0 && (
          <p className="text-sm text-sidebar-foreground/70" data-testid="text-latest-products">
            {mentionCount} menções:{" "}
            <ProductLinks products={products} className="font-semibold text-sidebar-foreground underline-offset-2 hover:underline" />
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={`/episodios/${episode.id}`}
            onClick={() => trackOpen(episode)}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-sidebar-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
          >
            Ver episódio <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <PodcastLinks
            episode={episode}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-sidebar-border px-5 text-sm font-semibold outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-foreground"
          />
        </div>
      </div>
    </section>
  );
}

/** C: linha editorial entre duas linhas finas, no mesmo idioma da faixa de números. */
function LatestEpisodeEditorial({ episode, cast, mentionCount, products }: LatestEpisodeProps) {
  return (
    <section className="grid gap-4 border-y py-8 md:grid-cols-[14rem_1fr] md:gap-10" data-testid="card-latest-episode">
      <div>
        <p className="text-5xl font-extrabold leading-none tracking-[-0.035em] md:text-6xl">
          #{episode.id}
          <span className="text-primary" aria-hidden="true">.</span>
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Último episódio
          <br />
          {formatDate(episode.date)}
        </p>
      </div>
      <div className="min-w-0 space-y-3">
        <h2 className="text-2xl font-extrabold leading-tight tracking-[-0.03em] text-balance md:text-3xl" data-testid="text-latest-title">
          <Link
            href={`/episodios/${episode.id}`}
            className="group inline underline-offset-4 hover:underline"
            onClick={() => trackOpen(episode)}
          >
            {episode.title}
            <ArrowRight className="ml-2 inline h-6 w-6 align-[-0.1em] transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </h2>
        {cast.length > 0 && <p className="text-sm text-muted-foreground">Com {joinNames(cast.map((p) => p.name))}</p>}
        {products.length > 0 && (
          <p className="text-sm" data-testid="text-latest-products">
            <span className="text-muted-foreground">{mentionCount} menções: </span>
            <ProductLinks products={products} className="font-semibold underline-offset-2 hover:underline" />
          </p>
        )}
      </div>
    </section>
  );
}

export function LatestEpisode({ variant, ...props }: LatestEpisodeProps & { variant: LatestEpisodeVariant }) {
  if (variant === "escuro") return <LatestEpisodeEscuro {...props} />;
  if (variant === "editorial") return <LatestEpisodeEditorial {...props} />;
  return <LatestEpisodeCinza {...props} />;
}
