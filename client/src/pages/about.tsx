import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight, Globe } from "lucide-react";
import { posthog } from "@/lib/analytics";
import { SiLinkedin, SiSpotify, SiYoutube } from "react-icons/si";
import { cn } from "@/lib/utils";
import { getAboutCopy, getThousandthMention, MAINTAINER, REPLIT_URL } from "@/lib/about";
import { formatLongDate } from "@/lib/dates";
import { SPOTIFY_SHOW_URL, YOUTUBE_CHANNEL_URL } from "@/lib/seo";
import arthurImg from "@assets/arthur_1772132984125.webp";
import aquisImg from "@assets/aiquis_1772132984122.webp";

const hosts = [
  { id: "arthur", name: "Arthur Castro", img: arthurImg },
  { id: "aiquis", name: "Aíquis Rodrigues", img: aquisImg },
];

const explore = [
  { href: "/episodes", label: "Episódios", text: "todos os episódios, com os produtos citados em cada um" },
  { href: "/products", label: "Produtos", text: "o ranking dos produtos mais mencionados" },
  { href: "/categories", label: "Categorias", text: "os produtos agrupados por tipo" },
  { href: "/people", label: "Pessoas", text: "o que cada participante recomendou" },
];

const pillBase =
  "inline-flex h-12 items-center gap-2 rounded-full border px-5 text-base font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2";
const pillLight = "bg-card hover:bg-highlight focus-visible:ring-ring";
const pillDark = "border-sidebar-border hover:bg-sidebar-accent focus-visible:ring-sidebar-foreground focus-visible:ring-offset-sidebar";

function ExternalPill({ href, onClick, dark, children }: { href: string; onClick: () => void; dark?: boolean; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(pillBase, dark ? pillDark : pillLight)} onClick={onClick}>
      {children}
    </a>
  );
}

/** Faixa de ponta a ponta (anula o padding do <main>), no estilo das seções da Product Arena. */
function Band({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("-mx-4 px-4 py-14 md:-mx-8 md:px-8 md:py-20", className)}>{children}</section>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-balance md:text-[2.75rem]">{children}</h2>;
}

export default function AboutPage() {
  const copy = getAboutCopy();
  const milestone = getThousandthMention();

  return (
    <div className="-mb-4 text-lg leading-relaxed md:-mb-8">
      <div className="pb-14 md:pb-20">
        <h1 className="page-title" data-testid="text-page-title">Sobre o Radar<span className="text-primary" aria-hidden="true">.</span></h1>
        <p className="page-lead max-w-2xl">Um radar feito por fã dos produtos da semana do Papo na Arena</p>
        {/* Compromisso de marca: o aviso de fã é o destaque da página (coral como fundo, texto escuro) */}
        <div className="mt-8 rounded-lg bg-primary px-6 py-6 text-primary-foreground md:px-8 md:py-7" data-testid="text-fan-notice">
          <p className="text-2xl font-extrabold leading-tight tracking-[-0.03em] md:text-3xl">{copy.fanTitle}</p>
          <p className="mt-2 text-lg leading-relaxed">{copy.fanBody}</p>
        </div>
      </div>

      {/* O podcast: texto à esquerda, fotos grandes dos hosts à direita */}
      <Band className="border-t">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
          <div className="max-w-2xl space-y-5">
            <SectionTitle>O podcast Papo na Arena<span className="text-primary" aria-hidden="true">.</span></SectionTitle>
            <p>{copy.podcast}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <ExternalPill href={SPOTIFY_SHOW_URL} onClick={() => posthog.capture("podcast_link_clicked", { platform: "spotify", source: "about" })}>
                <SiSpotify aria-hidden="true" className="h-4 w-4 text-brand-spotify" /> Ouvir no Spotify
              </ExternalPill>
              <ExternalPill href={YOUTUBE_CHANNEL_URL} onClick={() => posthog.capture("podcast_link_clicked", { platform: "youtube", source: "about" })}>
                <SiYoutube aria-hidden="true" className="h-4 w-4 text-brand-youtube" /> Assistir no YouTube
              </ExternalPill>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:max-w-md" aria-label="Hosts">
            {hosts.map((host) => (
              <li key={host.id}>
                <Link href={`/people/${host.id}`} className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4">
                  <img
                    src={host.img}
                    alt=""
                    width={256}
                    height={256}
                    className="aspect-square w-full rounded-lg bg-highlight object-cover transition-opacity group-hover:opacity-90 lg:w-52"
                  />
                  <span className="mt-3 block text-base font-bold leading-tight group-hover:underline">{host.name}</span>
                  <span className="block text-sm text-muted-foreground">Host</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Band>

      {/* O site: título à esquerda, atalhos em lista à direita, em faixa cinza */}
      <Band className="bg-highlight">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <div className="space-y-5">
            <SectionTitle>O que é este site<span className="text-primary" aria-hidden="true">.</span></SectionTitle>
            <p>{copy.site}</p>
          </div>
          <ul className="self-start border-t border-foreground/15">
            {explore.map((item) => (
              <li key={item.href} className="border-b border-foreground/15">
                <Link
                  href={item.href}
                  className="group flex min-h-16 items-center justify-between gap-4 px-2 py-4 outline-none transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <span>
                    <span className="block text-xl font-bold leading-tight tracking-[-0.02em]">{item.label}</span>
                    <span className="block text-base text-muted-foreground">{item.text}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Band>

      {/* Marco do produto nº 1.000: número gigante à esquerda, a história à direita */}
      {milestone && (
        <Band>
          <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-center lg:gap-16">
            <p className="text-[6rem] font-extrabold leading-none tracking-[-0.05em] md:text-[9rem]" aria-hidden="true">
              #1000<span className="text-primary">.</span>
            </p>
            <div className="max-w-2xl space-y-5">
              <SectionTitle>O produto nº 1.000<span className="text-primary" aria-hidden="true">.</span></SectionTitle>
              <p>
                O milésimo produto da semana registrado no Radar foi{" "}
                <Link href={`/products/${milestone.product.id}`} className="font-bold underline underline-offset-4 hover:no-underline">
                  {milestone.product.name}
                </Link>
                , citado por{" "}
                <Link href={`/people/${milestone.person.id}`} className="font-bold underline underline-offset-4 hover:no-underline">
                  {milestone.person.name}
                </Link>{" "}
                no episódio #{milestone.episode.id}, “{milestone.episode.title}”, de {formatLongDate(milestone.episode.date)}.
              </p>
              <Link
                href={`/episodes/${milestone.episode.id}`}
                className={cn(pillBase, pillLight)}
                onClick={() => posthog.capture("about_milestone_clicked", { episode_id: milestone.episode.id })}
              >
                Ver o episódio #{milestone.episode.id} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Band>
      )}

      {/* Quem faz: faixa escura no fim da página */}
      <Band className="bg-sidebar text-sidebar-foreground">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <SectionTitle>Quem faz<span className="text-primary" aria-hidden="true">.</span></SectionTitle>
          <div className="max-w-2xl space-y-6">
            <p>
              Mantido por{" "}
              <Link href={`/people/${MAINTAINER.personId}`} className="font-bold underline underline-offset-4 hover:no-underline">
                {MAINTAINER.name}
              </Link>
              . As menções são adicionadas à mão depois que cada episódio vai ao ar.
            </p>
            <div className="flex flex-wrap gap-3">
              <ExternalPill dark href={MAINTAINER.siteUrl} onClick={() => posthog.capture("maintainer_link_clicked", { platform: "site", source: "about" })}>
                <Globe aria-hidden="true" className="h-4 w-4" /> carlosbronze.com.br
              </ExternalPill>
              <ExternalPill dark href={MAINTAINER.linkedinUrl} onClick={() => posthog.capture("maintainer_link_clicked", { platform: "linkedin", source: "about" })}>
                <SiLinkedin aria-hidden="true" className="h-4 w-4" /> LinkedIn
              </ExternalPill>
            </div>
            <p className="border-t border-sidebar-border pt-6 text-base text-sidebar-foreground/70">
              {copy.replit}{" "}
              <a
                href={REPLIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sidebar-foreground underline-offset-4 hover:underline"
                onClick={() => posthog.capture("replit_link_clicked", { source: "about" })}
              >
                Conheça o Replit
              </a>
              .
            </p>
          </div>
        </div>
      </Band>
    </div>
  );
}
