import '@testing-library/jest-dom';

// Polyfill for matchMedia which is not implemented in jsdom
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { }, // Deprecated but included for compat
        removeListener: () => { }, // Deprecated but included for compat
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false,
    }),
});

// Polyfill Deno for Edge Functions testing
(globalThis as any).Deno = {
    env: {
        get: (key: string) => `mock-${key}`,
    },
    serve: (handler: any) => {
        (globalThis as any).registeredEdgeFunction = handler;
    },
};
