import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { RouteSeo } from "@/components/route-seo";
const Dashboard = lazy(() => import("@/pages/dashboard"));
const EpisodesPage = lazy(() => import("@/pages/episodes"));
const ProductsPage = lazy(() => import("@/pages/products"));
const CategoriesPage = lazy(() => import("@/pages/categories"));
const PeoplePage = lazy(() => import("@/pages/people"));
const AboutPage = lazy(() => import("@/pages/about"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/episodios" component={EpisodesPage} />
        <Route path="/episodios/:id" component={EpisodesPage} />
        <Route path="/produtos" component={ProductsPage} />
        <Route path="/produtos/:id" component={ProductsPage} />
        <Route path="/categorias" component={CategoriesPage} />
        <Route path="/categorias/:name" component={CategoriesPage} />
        <Route path="/pessoas" component={PeoplePage} />
        <Route path="/pessoas/:id" component={PeoplePage} />
        <Route path="/sobre" component={AboutPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <RouteSeo />
      <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 items-center border-b px-2 lg:hidden">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            <Router />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export default App;
