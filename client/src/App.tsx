import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import Dashboard from "@/pages/dashboard";
import EpisodesPage from "@/pages/episodes";
import ProductsPage from "@/pages/products";
import CategoriesPage from "@/pages/categories";
import PeoplePage from "@/pages/people";
import NotFound from "@/pages/not-found";

function Router() {
  return (
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
  );
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
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
