import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Phone, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * /strategy — Landing page for PDF "Request Strategy Session" CTA.
 *
 * Opens when a user clicks the CTA button in their Blueprint PDF.
 * Reads ?id=<blueprint_id> and calls the request-clarity-call edge function.
 */

export default function StrategyRedirect() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const blueprintId = searchParams.get('id');

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle');

    // Auto-trigger the request on mount if we have an ID
    const handleRequest = useCallback(async () => {
        if (!blueprintId || status === 'loading' || status === 'success') return;

        setStatus('loading');
        try {
            const { data, error } = await supabase.functions.invoke('request-clarity-call', {
                body: { blueprint_id: blueprintId },
            });

            if (error || !data?.success) {
                // Check if already requested
                if (data?.message?.includes('already')) {
                    setStatus('already');
                } else {
                    setStatus('error');
                }
                return;
            }

            setStatus('success');
        } catch {
            setStatus('error');
        }
    }, [blueprintId, status]);

    // Auto-request on mount
    useEffect(() => {
        if (blueprintId && status === 'idle') {
            handleRequest();
        }
    }, [blueprintId, handleRequest, status]);

    if (!blueprintId) {
        return (
            <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
                <h1 className="font-nohemi text-2xl md:text-3xl font-medium mb-4">Invalid Link</h1>
                <p className="text-muted-foreground mb-8">
                    This link appears to be missing a Blueprint ID. Please use the link from your PDF.
                </p>
                <Button variant="outline" onClick={() => navigate('/blueprint')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go to Blueprint
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-md w-full text-center"
            >
                {/* Loading state */}
                {status === 'loading' && (
                    <div className="space-y-6">
                        <Loader2 className="w-12 h-12 animate-spin text-[#d4a853] mx-auto" />
                        <h1 className="font-nohemi text-2xl md:text-3xl font-medium">
                            Sending your request…
                        </h1>
                        <p className="text-muted-foreground">
                            We're notifying our team about your strategy session request.
                        </p>
                    </div>
                )}

                {/* Success state */}
                {status === 'success' && (
                    <div className="space-y-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto"
                        >
                            <Check className="w-10 h-10 text-emerald-400" />
                        </motion.div>
                        <div>
                            <h1 className="font-nohemi text-2xl md:text-3xl font-medium mb-3">
                                Request Received
                            </h1>
                            <p className="text-muted-foreground leading-relaxed">
                                We'll be in touch within <span className="text-foreground font-medium">24 hours</span> to schedule your strategy session.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/blueprint')}
                            className="border-[#d4a853]/30 hover:border-[#d4a853]/50 hover:bg-[#d4a853]/5"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Cleland Studio
                        </Button>
                    </div>
                )}

                {/* Already requested state */}
                {status === 'already' && (
                    <div className="space-y-8">
                        <div className="w-20 h-20 rounded-full bg-[#d4a853]/10 border border-[#d4a853]/20 flex items-center justify-center mx-auto">
                            <Phone className="w-10 h-10 text-[#d4a853]" />
                        </div>
                        <div>
                            <h1 className="font-nohemi text-2xl md:text-3xl font-medium mb-3">
                                Already Requested
                            </h1>
                            <p className="text-muted-foreground leading-relaxed">
                                A strategy session has already been requested for this Blueprint. Our team will be reaching out shortly.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/blueprint')}
                            className="border-[#d4a853]/30 hover:border-[#d4a853]/50 hover:bg-[#d4a853]/5"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Cleland Studio
                        </Button>
                    </div>
                )}

                {/* Error state */}
                {status === 'error' && (
                    <div className="space-y-8">
                        <div>
                            <h1 className="font-nohemi text-2xl md:text-3xl font-medium mb-3">
                                Something Went Wrong
                            </h1>
                            <p className="text-muted-foreground leading-relaxed mb-6">
                                We couldn't process your request. Please try again, or reach out to us directly.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Button
                                onClick={() => { setStatus('idle'); handleRequest(); }}
                                className="w-full bg-[#d4a853] hover:bg-[#c49a45] text-[#0a0a0f]"
                            >
                                Try Again
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Or email us at{' '}
                                <a href="mailto:crafted@cleland.studio" className="text-[#d4a853] hover:underline">
                                    crafted@cleland.studio
                                </a>
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
