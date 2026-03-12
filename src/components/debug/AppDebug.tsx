import { Component, ErrorInfo, ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// ERROR BOUNDARY
// ═══════════════════════════════════════════════════════════════════════════
interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

const CHUNK_RELOAD_KEY = "chunk-reload-attempted";

/**
 * Detects chunk / dynamic-import failures that happen after a new deploy
 * invalidates old hashed filenames while the browser is still serving
 * a stale index.html from cache.
 */
function isChunkLoadError(error: Error): boolean {
    const msg = error.message?.toLowerCase() ?? "";
    return (
        msg.includes("importing a module script failed") ||
        msg.includes("failed to fetch dynamically imported module") ||
        msg.includes("loading chunk") ||
        msg.includes("loading css chunk") ||
        (error.name === "TypeError" && msg.includes("failed to fetch"))
    );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });

        // ── Auto-reload once for stale-chunk errors ──────────────────────
        if (isChunkLoadError(error)) {
            const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY);
            if (!alreadyReloaded) {
                sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
                window.location.reload();
                return;
            }
        }
    }

    render() {
        if (this.state.hasError) {
            const isChunk = this.state.error ? isChunkLoadError(this.state.error) : false;

            return (
                <div className="fixed inset-0 z-[99999] bg-slate-950 p-6 overflow-auto text-white font-mono">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-red-500 text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="p-1 bg-red-500 text-white rounded">FATAL ERROR</span>
                            <span>Application Crashed</span>
                        </h1>
                        <div className="bg-slate-900 border border-red-900/50 rounded p-4 mb-6">
                            <p className="text-red-400 font-bold mb-2">Message:</p>
                            <pre className="whitespace-pre-wrap text-sm">{this.state.error?.message}</pre>
                        </div>
                        {isChunk && (
                            <div className="bg-amber-900/30 border border-amber-700/50 rounded p-4 mb-6">
                                <p className="text-amber-400 text-sm">
                                    ⚠ A new version was deployed while this page was open.
                                    Please refresh to load the latest version.
                                </p>
                            </div>
                        )}
                        {this.state.errorInfo && (
                            <div className="bg-slate-900 border border-slate-800 rounded p-4 overflow-auto">
                                <p className="text-slate-400 font-bold mb-2">Component Stack Trace:</p>
                                <pre className="text-[10px] leading-tight text-slate-500">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                sessionStorage.removeItem(CHUNK_RELOAD_KEY);
                                window.location.reload();
                            }}
                            className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-500 transition-colors rounded font-bold uppercase tracking-widest text-xs"
                        >
                            Force Hard Refresh
                        </button>
                    </div>
                </div>
            );
        }

        // Clear the reload flag on successful render
        sessionStorage.removeItem(CHUNK_RELOAD_KEY);
        return this.props.children;
    }
}
