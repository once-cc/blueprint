// App.tsx - Main application entry point
import React, { useState, useEffect } from "react";
import { Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GlassEdges } from "@/components/cinematic/GlassEdges";
import { ChamberGate } from "@/components/cinematic/ChamberGate";
import { PrivateAccessGate } from "@/components/cinematic/PrivateAccessGate";
import { ChamberGateProvider, useChamberGateContext } from "@/contexts/ChamberGateContext";
import { SmoothScrollProvider, useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { RedirectToExternal } from "@/components/RedirectToExternal";
import { cn } from "@/lib/utils";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Contact = lazy(() => import("./pages/Contact"));
const Blueprint = lazy(() => import("./pages/Blueprint"));
const Configurator = lazy(() => import("./pages/Configurator"));
const Auth = lazy(() => import("./pages/Auth"));
const BlueprintPreview = lazy(() => import("./pages/BlueprintPreview"));

const queryClient = new QueryClient();

// Routes that bypass the access gate (for PDF generation, etc.)
const GATE_EXEMPT_ROUTES = ['/blueprint-preview', '/blueprint/pdf-preview'];

import { ErrorBoundary } from "@/components/debug/AppDebug";

function DeferMainContent({ children }: { children: React.ReactNode }) {
  const { isReady } = useSmoothScroll();
  const [timedOut, setTimedOut] = useState(false);

  // Failsafe: If Lenis doesn't report ready in 1.5s, mount anyway
  useEffect(() => {
    if (isReady) return;
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isReady]);

  // High-fidelity loading state to prevent blank screens
  const loadingPlaceholder = (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[1001]">
      <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-display animate-pulse">
        Initializing...
      </span>
    </div>
  );

  if (!isReady && !timedOut) return loadingPlaceholder;

  return (
    <Suspense fallback={loadingPlaceholder}>
      {children}
    </Suspense>
  );
}

function AppContent() {
  const location = useLocation();
  const [hasAccess, setHasAccess] = useState(false);
  const { isClosing, isOpening, blurPhase, handleCloseComplete, handleOpenComplete } = useChamberGateContext();

  // Check if already authenticated this session
  useEffect(() => {
    const accessGranted = sessionStorage.getItem("siteAccessGranted");
    if (accessGranted === "true") {
      setHasAccess(true);
      window.scrollTo(0, 0);
    }
  }, []);

  const handleAccessGranted = () => {
    sessionStorage.setItem("siteAccessGranted", "true");
    setHasAccess(true);
    window.scrollTo(0, 0);
  };

  return (
    <ErrorBoundary>

      <AnimatePresence mode="wait">
        {!hasAccess && (
          <PrivateAccessGate key="gate" onAccessGranted={handleAccessGranted} />
        )}
      </AnimatePresence>

      {hasAccess && (
        <SmoothScrollProvider enabled={hasAccess}>
          <ChamberGate
            isClosing={isClosing}
            isOpening={isOpening}
            onCloseComplete={handleCloseComplete}
            onOpenComplete={handleOpenComplete}
          />
          <GlassEdges />
          <div
            className={cn(
              "relative min-h-screen w-full bg-background transition-all duration-700 ease-in-out",
              blurPhase === 'closing' && 'blur-parallax-closing',
              blurPhase === 'opening' && 'blur-parallax-opening',
              blurPhase === 'held' && 'blur-parallax-held'
            )}
          >
            <DeferMainContent>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blueprint" element={<Blueprint />} />
                <Route path="/configurator" element={<Configurator />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/blueprint-preview/:id" element={<BlueprintPreview />} />
                <Route path="/blueprint/pdf-preview" element={<BlueprintPreview />} />
                <Route
                  path="/portal/*"
                  element={<RedirectToExternal url="https://portal.clelandconsultancy.com" />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DeferMainContent>
          </div>
        </SmoothScrollProvider>
      )}
    </ErrorBoundary>
  );
}

// Separate component for exempt routes
function ExemptRouteHandler() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/blueprint-preview/:id" element={<BlueprintPreview />} />
        <Route path="/blueprint/pdf-preview" element={<BlueprintPreview />} />
      </Routes>
    </Suspense>
  );
}

function AppRouter() {
  const location = useLocation();
  const isExemptRoute = GATE_EXEMPT_ROUTES.some(route => location.pathname.startsWith(route));

  if (isExemptRoute) {
    return <ExemptRouteHandler />;
  }

  return (
    <ChamberGateProvider>
      <AppContent />
    </ChamberGateProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
