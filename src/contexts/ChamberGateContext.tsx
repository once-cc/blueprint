import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GATE_FLAG_KEY = 'from_chamber_gate';
const GATE_DESTINATION_KEY = 'chamber_gate_destination';

export type BlurPhase = 'idle' | 'closing' | 'held' | 'opening';

interface ChamberGateContextType {
  isClosing: boolean;
  isOpening: boolean;
  blurPhase: BlurPhase;
  triggerGateNavigation: (destination: string) => void;
  triggerGateToHome: () => void;
  handleCloseComplete: () => void;
  handleOpenComplete: () => void;
}

const ChamberGateContext = createContext<ChamberGateContextType | null>(null);

// Routes that trigger the chamber gate animation
const shouldUseGate = (from: string, to: string) => {
  const gateTransitions = [
    { from: '/', to: '/blueprint' },
    { from: '/blueprint', to: '/' },
    { from: '/blueprint', to: '/configurator' },
    { from: '/configurator', to: '/blueprint' },
  ];
  
  return gateTransitions.some(t => t.from === from && t.to === to);
};

export function ChamberGateProvider({ children }: { children: ReactNode }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [blurPhase, setBlurPhase] = useState<BlurPhase>('idle');
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);
  const [pendingScrollTop, setPendingScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Trigger gate close and navigate after animation
  const triggerGateNavigation = useCallback((destination: string) => {
    if (shouldUseGate(location.pathname, destination)) {
      setIsClosing(true);
      setBlurPhase('closing');
      setPendingDestination(destination);
    } else {
      navigate(destination);
    }
  }, [location.pathname, navigate]);

  // Trigger gate to home - ALWAYS triggers gate regardless of current route
  const triggerGateToHome = useCallback(() => {
    setIsClosing(true);
    setBlurPhase('closing');
    setPendingDestination('/');
    setPendingScrollTop(true);
  }, []);

  // Handle close complete - navigate to destination
  const handleCloseComplete = useCallback(() => {
    if (pendingDestination) {
      setBlurPhase('held');
      
      // If we're already on the destination and just need to scroll
      if (location.pathname === pendingDestination && pendingScrollTop) {
        window.scrollTo(0, 0); // Instant scroll while gate is closed
        localStorage.setItem(GATE_FLAG_KEY, 'true');
        setIsClosing(false);
        setIsOpening(true);
        setBlurPhase('opening');
        
        // Transition to idle after opening
        setTimeout(() => {
          setBlurPhase('idle');
        }, 1100);
      } else {
        localStorage.setItem(GATE_FLAG_KEY, 'true');
        localStorage.setItem(GATE_DESTINATION_KEY, pendingDestination);
        navigate(pendingDestination);
        setIsClosing(false);
      }
      
      setPendingDestination(null);
      setPendingScrollTop(false);
    }
  }, [pendingDestination, pendingScrollTop, location.pathname, navigate]);

  // Check for gate flag on mount and trigger opening
  useEffect(() => {
    const fromGate = localStorage.getItem(GATE_FLAG_KEY) === 'true';
    if (fromGate) {
      localStorage.removeItem(GATE_FLAG_KEY);
      localStorage.removeItem(GATE_DESTINATION_KEY);
      setIsOpening(true);
      setBlurPhase('opening');
      
      // Transition to idle after opening animation completes
      const timer = setTimeout(() => {
        setBlurPhase('idle');
      }, 1100); // Match animation duration
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Handle open complete
  const handleOpenComplete = useCallback(() => {
    setIsOpening(false);
  }, []);

  return (
    <ChamberGateContext.Provider
      value={{
        isClosing,
        isOpening,
        blurPhase,
        triggerGateNavigation,
        triggerGateToHome,
        handleCloseComplete,
        handleOpenComplete,
      }}
    >
      {children}
    </ChamberGateContext.Provider>
  );
}

export function useChamberGateContext() {
  const context = useContext(ChamberGateContext);
  if (!context) {
    throw new Error('useChamberGateContext must be used within a ChamberGateProvider');
  }
  return context;
}
