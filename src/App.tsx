// App.tsx - Main application entry point
import React, { useState, useEffect } from "react";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GlassEdges } from "@/components/cinematic/GlassEdges";
import { GlobalGrid } from "@/components/ui/global-grid";
import { SmoothScrollProvider, useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { RedirectToExternal } from "@/components/RedirectToExternal";

// Lazy load pages
const NotFound = lazy(() => import("./pages/NotFound"));
const Blueprint = lazy(() => import("./pages/Blueprint"));
const Configurator = lazy(() => import("./pages/Configurator"));
const Auth = lazy(() => import("./pages/Auth"));
const BlueprintPreview = lazy(() => import("./pages/BlueprintPreview"));
const ClarityRedirect = lazy(() => import("./pages/ClarityRedirect"));


const queryClient = new QueryClient();

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
      <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!isReady && !timedOut) return loadingPlaceholder;

  return (
    <Suspense fallback={loadingPlaceholder}>
      {children}
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <SmoothScrollProvider enabled={true}>
            <GlassEdges />
            <div className="relative min-h-screen w-full bg-background z-0">
              <GlobalGrid />
              <DeferMainContent>
                <Routes>
                  {/* Redirect root to blueprint configurator */}
                  <Route path="/" element={<Navigate to="/blueprint" replace />} />

                  {/* Preserved configurator & blueprint routes */}
                  <Route path="/blueprint" element={<Blueprint />} />
                  <Route path="/configurator" element={<Configurator />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/blueprint-preview/:id" element={<BlueprintPreview />} />
                  <Route path="/blueprint/pdf-preview" element={<BlueprintPreview />} />

                  {/* Clarity call CTA from PDF/email */}
                  <Route path="/clarity" element={<ClarityRedirect />} />


                  {/* External portal redirect */}
                  <Route
                    path="/portal/*"
                    element={<RedirectToExternal url="https://portal.clelandconsultancy.com" />}
                  />

                  {/* 404 for all other routes */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </DeferMainContent>
            </div>
          </SmoothScrollProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
