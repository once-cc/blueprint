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
    }

    render() {
        if (this.state.hasError) {
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
                        {this.state.errorInfo && (
                            <div className="bg-slate-900 border border-slate-800 rounded p-4 overflow-auto">
                                <p className="text-slate-400 font-bold mb-2">Component Stack Trace:</p>
                                <pre className="text-[10px] leading-tight text-slate-500">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-500 transition-colors rounded font-bold uppercase tracking-widest text-xs"
                        >
                            Force Hard Refresh
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}


