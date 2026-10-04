import { Link, useLocation } from "wouter";
import { BarChart3, Mic, Package, FolderOpen, Users, Info } from "lucide-react";
import { posthog } from "@/lib/analytics";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { REPLIT_URL } from "@/lib/about";

const navItems = [
  { title: "Dashboard", path: "/", icon: BarChart3 },
  { title: "Episódios", path: "/episodios", icon: Mic },
  { title: "Produtos", path: "/produtos", icon: Package },
  { title: "Categorias", path: "/categorias", icon: FolderOpen },
  { title: "Pessoas", path: "/pessoas", icon: Users },
  { title: "Sobre", path: "/sobre", icon: Info },
];

// Ícone "radar" do Material Design Icons (mdi-radar, @mdi/svg 7.4.47, Apache-2.0)
function RadarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.07,4.93L17.66,6.34C19.1,7.79 20,9.79 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12C4,7.92 7.05,4.56 11,4.07V6.09C8.16,6.57 6,9.03 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12C18,10.34 17.33,8.84 16.24,7.76L14.83,9.17C15.55,9.9 16,10.9 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12C8,10.14 9.28,8.59 11,8.14V10.28C10.4,10.63 10,11.26 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12C14,11.26 13.6,10.62 13,10.28V2H12A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,9.24 20.88,6.74 19.07,4.93Z" />
    </svg>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const { setOpenMobile } = useSidebar();
  // No mobile a sidebar é um painel sobreposto: fecha ao clicar em qualquer link interno
  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/"
          onClick={closeMobile}
          className="flex items-center gap-2 rounded-md px-2 py-3 outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent focus-visible:ring-2"
          data-testid="link-sidebar-home"
        >
          <RadarIcon className="h-8 w-8 shrink-0 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold" data-testid="sidebar-title">Papo na Arena</span>
            <span className="text-xs text-sidebar-foreground/70">Radar</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.path === "/" ? location === "/" : location.startsWith(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} className="h-12 px-3">
                      <Link href={item.path} onClick={closeMobile} data-testid={`nav-${item.title.toLowerCase()}`}>
                        <item.icon className={isActive ? "h-4 w-4 text-sidebar-primary" : "h-4 w-4"} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="px-4 py-2 text-xs text-sidebar-foreground/70">
          <Link href="/sobre" onClick={closeMobile} className="block py-1 underline-offset-2 hover:underline" data-testid="link-fan-notice">
            Projeto de fã, não oficial
          </Link>
          Feito com{" "}
          <a
            href={REPLIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-2 hover:underline"
            onClick={() => posthog.capture("replit_link_clicked", { source: "sidebar" })}
          >
            Replit
          </a>
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
