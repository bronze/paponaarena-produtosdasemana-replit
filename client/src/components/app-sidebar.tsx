import { Link, useLocation } from "wouter";
import { BarChart3, Mic, Package, Grid3X3, Users, Sun, Moon } from "lucide-react";
import { SiSpotify, SiYoutube } from "react-icons/si";
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
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", path: "/", icon: BarChart3 },
  { title: "Episódios", path: "/episodes", icon: Mic },
  { title: "Produtos", path: "/products", icon: Package },
  { title: "Categorias", path: "/categories", icon: Grid3X3 },
  { title: "Pessoas", path: "/people", icon: Users },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            PA
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold" data-testid="sidebar-title">Papo na Arena</span>
            <span className="text-xs text-muted-foreground">Radar</span>
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
                        <item.icon className="h-4 w-4" />
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
        <div className="flex gap-2 px-2 pt-2">
          <a href="https://open.spotify.com/show/7lcBkPYn5HgEZjTkJhNUFJ" target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2 border-[#1DB954]/40 text-[#1DB954] hover:bg-[#1DB954]/10">
              <SiSpotify className="h-4 w-4" /> Spotify
            </Button>
          </a>
          <a href="https://www.youtube.com/@PaponaArena" target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2 border-[#FF0000]/40 text-[#FF0000] hover:bg-[#FF0000]/10">
              <SiYoutube className="h-4 w-4" /> YouTube
            </Button>
          </a>
        </div>
        <div className="px-2 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start gap-2"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
