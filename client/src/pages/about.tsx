import { Link } from "wouter";
import { posthog } from "@/lib/analytics";
import { SiSpotify, SiYoutube } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAboutCopy, REPLIT_URL } from "@/lib/about";
import { SPOTIFY_SHOW_URL, YOUTUBE_CHANNEL_URL } from "@/lib/seo";

const explore = [
  { href: "/episodes", label: "Episódios", text: "todos os episódios, com os produtos citados em cada um" },
  { href: "/products", label: "Produtos", text: "o ranking dos produtos mais mencionados" },
  { href: "/categories", label: "Categorias", text: "os produtos agrupados por tipo" },
  { href: "/people", label: "Pessoas", text: "o que cada participante recomendou" },
];

export default function AboutPage() {
  const copy = getAboutCopy();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="page-title" data-testid="text-page-title">Sobre o Papo na Arena Radar<span className="text-primary" aria-hidden="true">.</span></h1>
        <p className="text-muted-foreground">O podcast, o site e quem faz parte dele</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">O podcast Papo na Arena</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>{copy.podcast}</p>
          <p>
            Hosts:{" "}
            <Link href="/people/arthur" className="font-medium hover:underline">Arthur</Link> e{" "}
            <Link href="/people/aiquis" className="font-medium hover:underline">Aíquis</Link>.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={SPOTIFY_SHOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-medium hover:underline"
              onClick={() => posthog.capture("podcast_link_clicked", { platform: "spotify", source: "about" })}
            >
              <SiSpotify aria-hidden="true" className="h-4 w-4 text-brand-spotify" /> Ouvir no Spotify
            </a>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-medium hover:underline"
              onClick={() => posthog.capture("podcast_link_clicked", { platform: "youtube", source: "about" })}
            >
              <SiYoutube aria-hidden="true" className="h-4 w-4 text-brand-youtube" /> Assistir no YouTube
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">O que é este site</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>{copy.site}</p>
          <ul className="space-y-1.5">
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="font-medium hover:underline">{item.label}</Link>
                <span className="text-muted-foreground"> – {item.text}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-md border-l-4 border-primary bg-highlight px-4 py-3" data-testid="text-fan-notice">
            {copy.fan}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Feito com Replit</CardTitle></CardHeader>
        <CardContent className="text-sm leading-relaxed">
          <p>
            {copy.replit}{" "}
            <a
              href={REPLIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              onClick={() => posthog.capture("replit_link_clicked", { source: "about" })}
            >
              Conheça o Replit
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
