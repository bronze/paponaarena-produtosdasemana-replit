import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { RouteSeo } from "@/components/route-seo";
const Dashboard = lazy(() => import("@/pages/dashboard"));
const EpisodesPage = lazy(() => import("@/pages/episodes"));
const ProductsPage = lazy(() => import("@/pages/products"));
const CategoriesPage = lazy(() => import("@/pages/categories"));
const PeoplePage = lazy(() => import("@/pages/people"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/episodes" component={EpisodesPage} />
        <Route path="/episodes/:id" component={EpisodesPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/products/:id" component={ProductsPage} />
        <Route path="/categories" component={CategoriesPage} />
        <Route path="/categories/:name" component={CategoriesPage} />
        <Route path="/people" component={PeoplePage} />
        <Route path="/people/:id" component={PeoplePage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <RouteSeo />
        <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-12 items-center border-b px-4 lg:hidden">
              <SidebarTrigger />
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6">
              <Router />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
