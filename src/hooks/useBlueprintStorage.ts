import { useState, useCallback, useRef } from 'react';
import { getBlueprintClientWithToken, clearBlueprintClient } from '@/lib/blueprintClient';
import { Blueprint, BlueprintDeliver, BlueprintDesign, BlueprintDiscovery, SessionStatus } from '@/types/blueprint';
import { useToast } from '@/hooks/use-toast';

export const STORAGE_KEY = 'blueprint_id';
export const SESSION_TOKEN_KEY = 'blueprint_session_token';
export const DREAM_INTENT_KEY = 'dream_intent';
export const LOCAL_DRAFT_KEY = 'blueprint_draft';
export const DEBOUNCE_MS = 1000;

export const mapDbToBlueprint = (
    data: Record<string, unknown>,
    storedDreamIntent?: string | null
): Blueprint => {
    return {
        id: data.id as string,
        status: data.status as 'draft' | 'submitted' | 'generated',
        userEmail: data.user_email as string | undefined,
        firstName: data.first_name as string | undefined,
        lastName: data.last_name as string | undefined,
        businessName: data.business_name as string | undefined,
        dreamIntent: storedDreamIntent || undefined,
        discovery: (data.discovery as unknown as BlueprintDiscovery) || {},
        design: (data.design as unknown as BlueprintDesign) || {},
        deliver: (data.deliver as unknown as BlueprintDeliver) || {},
        pdfUrl: data.pdf_url as string | undefined,
        currentStep: (data.current_step as number) || 1,
        createdAt: new Date(data.created_at as string),
        updatedAt: new Date(data.updated_at as string),
        submittedAt: data.submitted_at
            ? new Date(data.submitted_at as string)
            : undefined
    };
};

export const useBlueprintStorage = (
    setBlueprint: React.Dispatch<React.SetStateAction<Blueprint | null>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setSessionStatus: React.Dispatch<React.SetStateAction<SessionStatus>>
) => {
    const { toast } = useToast();
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    const loadLocalDraft = useCallback((): Partial<Blueprint> | null => {
        try {
            const draft = localStorage.getItem(LOCAL_DRAFT_KEY);
            return draft ? JSON.parse(draft) : null;
        } catch (e) {
            console.error('Failed to parse local draft:', e);
            return null;
        }
    }, []);

    const saveLocalDraft = useCallback((data: Partial<Blueprint>) => {
        try {
            // Don't save if it's already submitted
            if (data.status === 'submitted' || data.status === 'generated') {
                localStorage.removeItem(LOCAL_DRAFT_KEY);
                return;
            }
            localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify({
                ...data,
                updatedAt: new Date().toISOString()
            }));
        } catch (e) {
            console.error('Failed to save local draft:', e);
        }
    }, []);

    const syncToDatabase = useCallback(async (currentBlueprint: Blueprint) => {
        if (!currentBlueprint?.id) return;

        try {
            // Don't sync if it's already submitted and we're not explicitly updating the status
            if (currentBlueprint.status !== 'draft') {
                console.log('[Blueprint] Skipping sync for submitted blueprint');
                return;
            }

            console.log('[Blueprint] Syncing to database...', currentBlueprint.id);

            const payload = {
                discovery: currentBlueprint.discovery,
                design: currentBlueprint.design,
                deliver: currentBlueprint.deliver,
                dream_intent: currentBlueprint.dreamIntent ?? null,
                current_step: currentBlueprint.currentStep,
                updated_at: new Date().toISOString(),
            };

            const blueprintClient = getBlueprintClientWithToken(currentBlueprint.id);

            const { error } = await blueprintClient
                .from('blueprints')
                .update(payload)
                .eq('id', currentBlueprint.id);

            if (error) {
                console.error('[Blueprint] Sync error details:', error);

                if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
                    console.error('[Blueprint] Session expired or invalid');
                    toast({
                        title: "Session Expired",
                        description: "Your session has expired. Changes are saved locally.",
                        variant: "destructive"
                    });
                    // Note: Full recovery logic would typically clear the client here
                }
                throw error;
            }

            console.log('[Blueprint] Sync successful');
        } catch (error) {
            console.error('[Blueprint] Failed to sync to database:', error);
            saveLocalDraft(currentBlueprint);

            toast({
                title: "Sync Failed",
                description: "Don't worry, your progress is saved locally.",
                variant: "destructive"
            });
        }
    }, [saveLocalDraft, toast]);

    const queueSync = useCallback((currentBlueprint: Blueprint) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Debounce both local save and database sync to prevent blocking main UI thread
        saveTimeoutRef.current = setTimeout(() => {
            saveLocalDraft(currentBlueprint);
            syncToDatabase(currentBlueprint);
        }, DEBOUNCE_MS);
    }, [saveLocalDraft, syncToDatabase]);

    return {
        mapDbToBlueprint,
        loadLocalDraft,
        saveLocalDraft,
        syncToDatabase,
        queueSync,
    };
};
