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
} from "@/components/ui/sidebar";
import { REPLIT_URL } from "@/lib/about";

const navItems = [
  { title: "Dashboard", path: "/", icon: BarChart3 },
  { title: "Episódios", path: "/episodes", icon: Mic },
  { title: "Produtos", path: "/products", icon: Package },
  { title: "Categorias", path: "/categories", icon: FolderOpen },
  { title: "Pessoas", path: "/people", icon: Users },
  { title: "Sobre", path: "/sobre", icon: Info },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            PA
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold" data-testid="sidebar-title">Papo na Arena</span>
            <span className="text-xs text-sidebar-foreground/70">Radar</span>
          </div>
        </div>
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
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.path} data-testid={`nav-${item.title.toLowerCase()}`}>
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
          <Link href="/sobre" className="block py-1 underline-offset-2 hover:underline" data-testid="link-fan-notice">
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
