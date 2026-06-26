import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsProvider } from "./context/SettingsContext";
import { WeatherFamilyProvider } from "./context/WeatherFamilyContext";
import { useWeatherFamily } from "./context/useWeatherFamily";
import { AmbientWeatherCanvas } from "./animations/AmbientWeatherCanvas";
import { HomePage } from "./pages/HomePage";
import { WeatherMapPage } from "./pages/WeatherMapPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

type AppPage = "home" | "map";

function AppWithCanvas() {
  const { family } = useWeatherFamily();
  const [page, setPage] = useState<AppPage>("home");

  return (
    <>
      {/* Ambient canvas only on home page */}
      {page === "home" && <AmbientWeatherCanvas family={family} />}

      <div className="relative" style={{ zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {page === "home" ? (
            <HomePage
              key="home"
              onOpenMap={() => setPage("map")}
            />
          ) : (
            <WeatherMapPage
              key="map"
              onBack={() => setPage("home")}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <WeatherFamilyProvider>
          <AppWithCanvas />
        </WeatherFamilyProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
