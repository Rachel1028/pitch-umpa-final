import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FileProvider } from "./contexts/FileContext";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Analyze from "./pages/Analyze";
import Compare from "./pages/Compare";
import Realtime from "./pages/Realtime";
import Settings from "./pages/Settings";
import Team from "./pages/Team";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/upload"} component={Upload} />
      <Route path={"/analyze"} component={Analyze} />
      <Route path={"/compare"} component={Compare} />
      <Route path={"/realtime"} component={Realtime} />
      <Route path={"/settings"} component={Settings} />
      <Route path="/team" component={Team} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <FileProvider>
        <ThemeProvider
          defaultTheme="dark"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </FileProvider>
    </ErrorBoundary>
  );
}

export default App;
