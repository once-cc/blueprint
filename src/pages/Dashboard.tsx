/**
 * Studio Dashboard — Blueprint Intelligence Hub
 * 
 * Protected route for studio users to view, filter, sort, and manage
 * all submitted blueprints with their scores, email status, and artifacts.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowUpDown, ArrowUp, ArrowDown, Eye, Download, Search, Filter, X, FileJson, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

// ── Types ───────────────────────────────────────────────────

interface DashboardBlueprint {
    id: string;
    business_name: string | null;
    user_name: string | null;
    user_email: string | null;
    status: string;
    created_at: string;
    submitted_at: string | null;
    deliver: Record<string, unknown>;
    // Joined data
    scores: { integrity_score: number; complexity_score: number } | null;
    email_sequences: Array<{ email_type: string; status: string; sent_at: string | null }>;
    bookings: Array<{ booked_at: string; source: string }>;
}

type SortField = "business_name" | "submitted_at" | "integrity" | "complexity" | "budget" | "timeline" | "status";
type SortDirection = "asc" | "desc";

// ── Complexity Tier Badge ───────────────────────────────────

function ComplexityBadge({ score }: { score: number }) {
    const tier = score >= 60 ? "Enterprise" : score >= 30 ? "Professional" : "Essential";
    const colors = {
        Enterprise: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        Professional: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        Essential: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border rounded ${colors[tier]}`}>
            {tier} ({score})
        </span>
    );
}

// ── Integrity Score Bar ─────────────────────────────────────

function IntegrityBar({ score }: { score: number }) {
    const color = score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-400";
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{score}</span>
        </div>
    );
}

// ── Email Status Indicator ──────────────────────────────────

function EmailStatus({ sequences }: { sequences: DashboardBlueprint["email_sequences"] }) {
    if (!sequences || sequences.length === 0) return <span className="text-xs text-muted-foreground">—</span>;

    const sent = sequences.filter((s) => s.status === "sent").length;
    const pending = sequences.filter((s) => s.status === "pending").length;
    const cancelled = sequences.filter((s) => s.status === "cancelled").length;

    return (
        <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => {
                const seq = sequences[i];
                const color = !seq ? "bg-white/5" : seq.status === "sent" ? "bg-emerald-500" : seq.status === "pending" ? "bg-amber-500" : "bg-white/10";
                return <div key={i} className={`w-2 h-2 rounded-full ${color}`} title={seq ? `${seq.email_type}: ${seq.status}` : ""} />;
            })}
            <span className="text-[10px] text-muted-foreground ml-1">
                {sent}/{sent + pending + cancelled}
            </span>
        </div>
    );
}

// ── Booking Status ──────────────────────────────────────────

function BookingStatus({ bookings }: { bookings: DashboardBlueprint["bookings"] }) {
    if (!bookings || bookings.length === 0) {
        return <span className="text-xs text-muted-foreground">No booking</span>;
    }
    const latest = bookings[0];
    return (
        <span className="text-xs text-emerald-400">
            ✓ {new Date(latest.booked_at).toLocaleDateString()}
        </span>
    );
}

// ── Lifecycle Badge ─────────────────────────────────────────

function LifecycleBadge({ status, hasBooking }: { status: string; hasBooking: boolean }) {
    // Derive lifecycle state: submitted → booked → portal_linked
    let lifecycle: 'submitted' | 'booked' | 'portal_linked';
    if (status === 'generated') {
        lifecycle = 'portal_linked';
    } else if (hasBooking || status === 'booked') {
        lifecycle = 'booked';
    } else {
        lifecycle = 'submitted';
    }

    const config = {
        submitted: { label: 'Submitted', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        booked: { label: 'Booked', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        portal_linked: { label: 'Portal', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    };

    const { label, color } = config[lifecycle];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider border rounded ${color}`}>
            {label}
        </span>
    );
}

// ── Days Since Submission ───────────────────────────────────

function daysSince(dateStr: string | null): number | null {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ── Artifact Modal ──────────────────────────────────────────

function ArtifactModal({ blueprintId, onClose }: { blueprintId: string; onClose: () => void }) {
    const [artifacts, setArtifacts] = useState<Array<{
        artifact_type: string;
        version: number;
        payload: unknown;
        file_url: string | null;
        hash: string;
        created_at: string;
    }> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchArtifacts() {
            // @ts-expect-error - Dynamic table access
            const { data, error } = await supabase
                .from("blueprint_artifacts")
                .select("artifact_type, version, payload, file_url, hash, created_at")
                .eq("blueprint_id", blueprintId)
                .order("artifact_type")
                .order("version", { ascending: false });

            if (!error && data) setArtifacts(data as unknown as NonNullable<typeof artifacts>);
            setLoading(false);
        }
        fetchArtifacts();
    }, [blueprintId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#12121a] border border-white/10 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h3 className="text-sm font-medium text-foreground">Artifacts</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-60px)]">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : !artifacts || artifacts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No artifacts found</p>
                    ) : (
                        <div className="space-y-4">
                            {artifacts.map((a, i) => (
                                <div key={i} className="border border-white/5 rounded p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <FileJson className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-xs font-medium uppercase tracking-wider text-foreground">
                                                {a.artifact_type}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">v{a.version}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-mono">{a.hash.slice(0, 12)}…</span>
                                    </div>
                                    {a.payload ? (
                                        <pre className="text-[11px] text-muted-foreground bg-black/30 rounded p-3 overflow-x-auto max-h-64">
                                            {JSON.stringify(a.payload, null, 2)}
                                        </pre>
                                    ) : a.file_url ? (
                                        <a href={a.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300">
                                            Download PDF →
                                        </a>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Dashboard Component ────────────────────────────────

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, isStudio, isLoading: authLoading } = useAuth();

    const [blueprints, setBlueprints] = useState<DashboardBlueprint[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<SortField>("submitted_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);
    const [quickFilter, setQuickFilter] = useState<'all' | 'high_complexity_no_booking'>('all');
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 25;

    // ── Auth Guard ────────────────────────────────────────────

    useEffect(() => {
        if (!authLoading && (!user || !isStudio)) {
            navigate("/auth");
        }
    }, [authLoading, user, isStudio, navigate]);

    // ── Fetch Data ────────────────────────────────────────────

    const fetchBlueprints = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch blueprints with joined scores, email sequences, and bookings
            const { data: bpData, error: bpError } = await supabase
                .from("blueprints")
                .select("id, business_name, user_name, user_email, status, created_at, submitted_at, deliver")
                .in("status", ["submitted", "generated", "booked"])
                .order("submitted_at", { ascending: false });

            if (bpError) throw bpError;

            const blueprintIds = (bpData || []).map((b) => b.id);

            // Fetch scores
            // @ts-expect-error - Dynamic table access
            const { data: scoresData } = await supabase
                .from("blueprint_scores")
                .select("blueprint_id, integrity_score, complexity_score")
                .in("blueprint_id", blueprintIds);

            // Fetch email sequences
            // @ts-expect-error - Dynamic table access
            const { data: emailData } = await supabase
                .from("email_sequences")
                .select("blueprint_id, email_type, status, sent_at")
                .in("blueprint_id", blueprintIds);

            // Fetch bookings
            // @ts-expect-error - Dynamic table access
            const { data: bookingsData } = await supabase
                .from("bookings")
                .select("blueprint_id, booked_at, source")
                .in("blueprint_id", blueprintIds);

            // Map scores, emails, and bookings to blueprints
            const scoresMap = new Map((scoresData as Record<string, unknown>[] || []).map((s) => [s.blueprint_id as string, s]));
            const emailsMap = new Map<string, Record<string, unknown>[]>();
            for (const e of (emailData as Record<string, unknown>[] || [])) {
                if (!emailsMap.has(e.blueprint_id as string)) emailsMap.set(e.blueprint_id as string, []);
                emailsMap.get(e.blueprint_id as string)!.push(e);
            }
            const bookingsMap = new Map<string, Record<string, unknown>[]>();
            for (const b of (bookingsData as Record<string, unknown>[] || [])) {
                if (!bookingsMap.has(b.blueprint_id as string)) bookingsMap.set(b.blueprint_id as string, []);
                bookingsMap.get(b.blueprint_id as string)!.push(b);
            }

            const enriched: DashboardBlueprint[] = (bpData || []).map((bp) => ({
                ...bp,
                deliver: (typeof bp.deliver === "object" && bp.deliver !== null && !Array.isArray(bp.deliver) ? bp.deliver : {}) as Record<string, unknown>,
                scores: scoresMap.get(bp.id) as unknown as DashboardBlueprint["scores"] || null,
                email_sequences: emailsMap.get(bp.id) as unknown as DashboardBlueprint["email_sequences"] || [],
                bookings: bookingsMap.get(bp.id) as unknown as DashboardBlueprint["bookings"] || [],
            }));

            setBlueprints(enriched);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user && isStudio) fetchBlueprints();
    }, [user, isStudio, fetchBlueprints]);

    // ── Sort + Filter ─────────────────────────────────────────

    const filteredAndSorted = useMemo(() => {
        let result = [...blueprints];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((bp) =>
                (bp.business_name?.toLowerCase().includes(term)) ||
                (bp.user_name?.toLowerCase().includes(term)) ||
                (bp.user_email?.toLowerCase().includes(term))
            );
        }

        // Quick filter: High Complexity + Not Booked
        if (quickFilter === 'high_complexity_no_booking') {
            result = result.filter((bp) =>
                (bp.scores?.complexity_score || 0) >= 60 &&
                (!bp.bookings || bp.bookings.length === 0) &&
                bp.status !== 'booked'
            );
        }

        // Sort
        result.sort((a, b) => {
            let aVal: string | number;
            let bVal: string | number;

            switch (sortField) {
                case "business_name":
                    aVal = a.business_name || "";
                    bVal = b.business_name || "";
                    break;
                case "submitted_at":
                    aVal = a.submitted_at || "";
                    bVal = b.submitted_at || "";
                    break;
                case "integrity":
                    aVal = a.scores?.integrity_score || 0;
                    bVal = b.scores?.integrity_score || 0;
                    break;
                case "complexity":
                    aVal = a.scores?.complexity_score || 0;
                    bVal = b.scores?.complexity_score || 0;
                    break;
                case "budget":
                    aVal = (a.deliver?.budget as string) || "";
                    bVal = (b.deliver?.budget as string) || "";
                    break;
                case "timeline":
                    aVal = (a.deliver?.timeline as string) || "";
                    bVal = (b.deliver?.timeline as string) || "";
                    break;
                case "status":
                    aVal = a.status;
                    bVal = b.status;
                    break;
                default:
                    return 0;
            }

            if (typeof aVal === "string" && typeof bVal === "string") {
                return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        });

        return result;
    }, [blueprints, searchTerm, sortField, sortDirection, quickFilter]);

    const paginatedResults = useMemo(() => {
        return filteredAndSorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    }, [filteredAndSorted, page]);

    const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE);

    // ── Sort Toggle ───────────────────────────────────────────

    function toggleSort(field: SortField) {
        if (sortField === field) {
            setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    }

    function SortIcon({ field }: { field: SortField }) {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-white/20" />;
        return sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />;
    }

    // ── Loading / Auth States ─────────────────────────────────

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user || !isStudio) return null;

    // ── Render ────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-white/5 px-6 py-4">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-medium">Blueprint Intelligence</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {blueprints.length} blueprint{blueprints.length !== 1 ? "s" : ""} submitted
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search clients…"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                                className="pl-9 pr-4 py-1.5 text-xs bg-white/5 border border-white/10 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-white/20 w-56"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={fetchBlueprints}
                            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 border border-white/10 rounded"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={() => { setQuickFilter(f => f === 'high_complexity_no_booking' ? 'all' : 'high_complexity_no_booking'); setPage(0); }}
                            className={`text-xs px-3 py-1.5 border rounded transition-colors ${quickFilter === 'high_complexity_no_booking'
                                ? 'border-amber-500/50 text-amber-300 bg-amber-500/10'
                                : 'border-white/10 text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            🟡 High Complexity + No Booking
                        </button>
                    </div>
                </div>
            </header>

            {/* Table */}
            <main className="max-w-[1400px] mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredAndSorted.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-sm text-muted-foreground">No blueprints found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {[
                                            { field: "business_name" as SortField, label: "Client" },
                                            { field: "submitted_at" as SortField, label: "Submitted" },
                                            { field: "complexity" as SortField, label: "Complexity" },
                                            { field: "integrity" as SortField, label: "Integrity" },
                                            { field: "budget" as SortField, label: "Budget" },
                                            { field: "timeline" as SortField, label: "Timeline" },
                                        ].map((col) => (
                                            <th
                                                key={col.field}
                                                className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium py-3 px-3 cursor-pointer select-none hover:text-foreground transition-colors"
                                                onClick={() => toggleSort(col.field)}
                                            >
                                                <div className="flex items-center gap-1">
                                                    {col.label}
                                                    <SortIcon field={col.field} />
                                                </div>
                                            </th>
                                        ))}
                                        <th className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium py-3 px-3">Email</th>
                                        <th className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium py-3 px-3">Booking</th>
                                        <th
                                            className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium py-3 px-3 cursor-pointer select-none hover:text-foreground transition-colors"
                                            onClick={() => toggleSort('status')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Lifecycle
                                                <SortIcon field="status" />
                                            </div>
                                        </th>
                                        <th className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium py-3 px-3">Days</th>
                                        <th className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium py-3 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedResults.map((bp) => (
                                        <tr key={bp.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                            {/* Client */}
                                            <td className="py-3 px-3">
                                                <div>
                                                    <p className="text-sm text-foreground">{bp.business_name || "Unnamed"}</p>
                                                    <p className="text-[11px] text-muted-foreground">{bp.user_name} · {bp.user_email}</p>
                                                </div>
                                            </td>
                                            {/* Submitted */}
                                            <td className="py-3 px-3">
                                                <span className="text-xs text-muted-foreground">
                                                    {bp.submitted_at ? new Date(bp.submitted_at).toLocaleDateString() : "—"}
                                                </span>
                                            </td>
                                            {/* Complexity */}
                                            <td className="py-3 px-3">
                                                {bp.scores ? <ComplexityBadge score={bp.scores.complexity_score} /> : <span className="text-xs text-muted-foreground">—</span>}
                                            </td>
                                            {/* Integrity */}
                                            <td className="py-3 px-3">
                                                {bp.scores ? <IntegrityBar score={bp.scores.integrity_score} /> : <span className="text-xs text-muted-foreground">—</span>}
                                            </td>
                                            {/* Budget */}
                                            <td className="py-3 px-3">
                                                <span className="text-xs text-muted-foreground capitalize">
                                                    {((bp.deliver?.budget as string) || "—").replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            {/* Timeline */}
                                            <td className="py-3 px-3">
                                                <span className="text-xs text-muted-foreground capitalize">
                                                    {((bp.deliver?.timeline as string) || "—").replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            {/* Email */}
                                            <td className="py-3 px-3">
                                                <EmailStatus sequences={bp.email_sequences} />
                                            </td>
                                            {/* Booking */}
                                            <td className="py-3 px-3">
                                                <BookingStatus bookings={bp.bookings} />
                                            </td>
                                            {/* Lifecycle */}
                                            <td className="py-3 px-3">
                                                <LifecycleBadge status={bp.status} hasBooking={bp.bookings?.length > 0} />
                                            </td>
                                            {/* Days Since Submission */}
                                            <td className="py-3 px-3">
                                                {(() => {
                                                    const days = daysSince(bp.submitted_at);
                                                    if (days === null) return <span className="text-xs text-muted-foreground">—</span>;
                                                    const urgencyClass = days >= 7 ? 'text-amber-400' : days >= 3 ? 'text-muted-foreground' : 'text-emerald-400';
                                                    return <span className={`text-xs tabular-nums ${urgencyClass}`}>{days}d</span>;
                                                })()}
                                            </td>
                                            {/* Actions */}
                                            <td className="py-3 px-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => window.open(`/blueprint-preview/${bp.id}`, "_blank")}
                                                        className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-white/5 transition-colors"
                                                        title="View Blueprint"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedArtifact(bp.id)}
                                                        className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-white/5 transition-colors"
                                                        title="View Artifacts"
                                                    >
                                                        <FileJson className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                <p className="text-xs text-muted-foreground">
                                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredAndSorted.length)} of {filteredAndSorted.length}
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-white/5"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs text-muted-foreground px-2">
                                        {page + 1} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-white/5"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Artifact Modal */}
            {selectedArtifact && (
                <ArtifactModal blueprintId={selectedArtifact} onClose={() => setSelectedArtifact(null)} />
            )}
        </div>
    );
}
