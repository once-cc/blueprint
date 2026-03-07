import { useState, useEffect, useCallback, useRef } from 'react';
import { getBlueprintClientWithToken, clearBlueprintClient } from '@/lib/blueprintClient';
import { supabase } from '@/integrations/supabase/client';
import { Blueprint, BlueprintDiscovery, BlueprintDesign, BlueprintDeliver, SessionStatus } from '@/types/blueprint';
import { useToast } from '@/hooks/use-toast';

import {
  STORAGE_KEY,
  SESSION_TOKEN_KEY,
  DREAM_INTENT_KEY,
  LOCAL_DRAFT_KEY,
  mapDbToBlueprint,
  useBlueprintStorage,
  DEBOUNCE_MS
} from './useBlueprintStorage';



export function useBlueprint() {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({ hasExisting: false, confirmed: false });
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);

  const {
    loadLocalDraft,
    saveLocalDraft,
    queueSync
  } = useBlueprintStorage(setBlueprint, setIsLoading, setSessionStatus);

  // Initialize or resume blueprint
  useEffect(() => {
    const initBlueprint = async () => {
      // Init lock - prevent double initialization
      if (isInitializingRef.current) return;
      isInitializingRef.current = true;
      const startTime = Date.now();

      const finishLoading = async () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < 1000) {
          await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
        }
        setIsLoading(false);
        isInitializingRef.current = false;
      };

      const storedId = localStorage.getItem(STORAGE_KEY);
      const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
      const storedDreamIntent = localStorage.getItem(DREAM_INTENT_KEY);
      const authUser = (await supabase.auth.getUser()).data.user;

      // FALLBACK: If we have ID but no token, clear ALL storage and start fresh
      if (storedId && !storedToken) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(DREAM_INTENT_KEY);
        localStorage.removeItem(LOCAL_DRAFT_KEY);
        // Fall through to create new blueprint
      }

      // Check for local un-sync'd draft
      const localDraftStr = localStorage.getItem(LOCAL_DRAFT_KEY);
      const localDraft = localDraftStr ? JSON.parse(localDraftStr) : null;

      // Attempt to resume existing blueprint using token-scoped client
      if (storedId && storedToken) {

        const blueprintClient = getBlueprintClientWithToken(storedToken);
        const { data, error } = await blueprintClient
          .from('blueprints')
          .select('*')
          .eq('id', storedId)
          .eq('status', 'draft')
          .maybeSingle();

        if (data && !error) {
          const dbBlueprint = mapDbToBlueprint(data as Record<string, unknown>, storedDreamIntent);
          let finalBlueprint = dbBlueprint;

          // Rescue local draft if it's more recent than DB
          if (localDraft && localDraft.id === dbBlueprint.id) {
            const localDate = new Date(localDraft.updatedAt).getTime();
            const dbDate = new Date(dbBlueprint.updatedAt).getTime();
            if (localDate > dbDate) {
              finalBlueprint = {
                ...dbBlueprint,
                discovery: { ...dbBlueprint.discovery, ...localDraft.discovery },
                design: { ...dbBlueprint.design, ...localDraft.design },
                deliver: { ...dbBlueprint.deliver, ...localDraft.deliver },
                currentStep: Math.max(dbBlueprint.currentStep, localDraft.currentStep),
                dreamIntent: localDraft.dreamIntent || dbBlueprint.dreamIntent,
                userEmail: localDraft.userEmail || dbBlueprint.userEmail,
                firstName: localDraft.firstName || dbBlueprint.firstName,
                lastName: localDraft.lastName || dbBlueprint.lastName,
                businessName: localDraft.businessName || dbBlueprint.businessName,
              };
              // Resync rescued progress in background
              setTimeout(() => {
                const client = getBlueprintClientWithToken(storedToken);
                client.from('blueprints').update({
                  discovery: finalBlueprint.discovery,
                  design: finalBlueprint.design,
                  deliver: finalBlueprint.deliver,
                  dream_intent: finalBlueprint.dreamIntent,
                  current_step: finalBlueprint.currentStep,
                  user_email: finalBlueprint.userEmail,
                  first_name: finalBlueprint.firstName,
                  last_name: finalBlueprint.lastName,
                  business_name: finalBlueprint.businessName
                }).eq('id', finalBlueprint.id).then(() => { });
              }, 1000);
            }
          }

          const hasProgress = (finalBlueprint.currentStep > 1) ||
            Object.values(finalBlueprint.discovery).some(v => v !== undefined && v !== '' && v !== null);

          // Time-based threshold: only show Welcome Back if last update was > 2 min ago
          const timeSinceUpdate = Date.now() - new Date(finalBlueprint.updatedAt).getTime();
          const isStaleSession = timeSinceUpdate > 2 * 60 * 1000; // 2 minutes

          // If user just arrived from the Blueprint page (fresh entry), auto-confirm session
          const isFreshEntry = sessionStorage.getItem('blueprint_fresh_entry') === 'true';
          sessionStorage.removeItem('blueprint_fresh_entry');

          setBlueprint(finalBlueprint);
          setSessionStatus({
            hasExisting: !!hasProgress,
            confirmed: isFreshEntry || !hasProgress || !isStaleSession,
          });
          await finishLoading();
          return;
        }

        // Load failed - log and clear ALL storage
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(DREAM_INTENT_KEY);
        localStorage.removeItem(LOCAL_DRAFT_KEY);
      }

      // Create new blueprint via RPC (bypasses RLS read-back issue)
      const { data, error } = await supabase
        .rpc('create_blueprint')
        .single();

      if (data && !error) {
        localStorage.setItem(STORAGE_KEY, data.id);
        localStorage.setItem(SESSION_TOKEN_KEY, data.session_token);

        setBlueprint({
          id: data.id,
          status: 'draft',
          dreamIntent: storedDreamIntent ?? undefined,
          discovery: (data.discovery as BlueprintDiscovery) || {},
          design: (data.design as BlueprintDesign) || {},
          deliver: (data.deliver as BlueprintDeliver) || {},
          currentStep: data.current_step,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });
        setSessionStatus({ hasExisting: false, confirmed: true });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to initialize blueprint. Please refresh.',
          variant: 'destructive',
        });
      }

      await finishLoading();
    };

    initBlueprint();
  }, [toast]);

  // Debounced save to database using token-scoped client
  const saveToDatabase = useCallback(async (updates: Partial<Blueprint>) => {
    if (!blueprint?.id) return;

    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
      return;
    }

    queueSync(updates as Blueprint);
  }, [blueprint?.id, queueSync]);

  const updateDiscovery = useCallback((updates: Partial<BlueprintDiscovery>) => {
    setBlueprint(prev => {
      if (!prev) return prev;
      const newDiscovery = { ...prev.discovery, ...updates };
      const newBlueprint = { ...prev, discovery: newDiscovery, updatedAt: new Date() };
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(newBlueprint));
      saveToDatabase({ discovery: newDiscovery });
      return newBlueprint;
    });
  }, [saveToDatabase]);

  // Update design data
  const updateDesign = useCallback((updates: Partial<BlueprintDesign>) => {
    setBlueprint(prev => {
      if (!prev) return prev;
      const newDesign = { ...prev.design, ...updates };
      const newBlueprint = { ...prev, design: newDesign, updatedAt: new Date() };
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(newBlueprint));
      saveToDatabase({ design: newDesign });
      return newBlueprint;
    });
  }, [saveToDatabase]);

  // Update deliver data
  const updateDeliver = useCallback((updates: Partial<BlueprintDeliver>) => {
    setBlueprint(prev => {
      if (!prev) return prev;
      const newDeliver = { ...prev.deliver, ...updates };
      const newBlueprint = { ...prev, deliver: newDeliver, updatedAt: new Date() };
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(newBlueprint));
      saveToDatabase({ deliver: newDeliver });
      return newBlueprint;
    });
  }, [saveToDatabase]);

  // Update dream intent
  const updateDreamIntent = useCallback((dreamIntent: string) => {
    localStorage.setItem(DREAM_INTENT_KEY, dreamIntent);
    setBlueprint(prev => {
      if (!prev) return prev;
      const newBlueprint = { ...prev, dreamIntent, updatedAt: new Date() };
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(newBlueprint));
      saveToDatabase({ dreamIntent });
      return newBlueprint;
    });
  }, [saveToDatabase]);

  // Update current step
  const setCurrentStep = useCallback((step: number) => {
    setBlueprint(prev => {
      if (!prev) return prev;
      const newBlueprint = { ...prev, currentStep: step, updatedAt: new Date() };
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(newBlueprint));
      saveToDatabase({ currentStep: step });
      return newBlueprint;
    });
  }, [saveToDatabase]);

  // Update user details
  const updateUserDetails = useCallback((details: { firstName?: string; lastName?: string; userEmail?: string; businessName?: string }) => {
    setBlueprint(prev => {
      if (!prev) return prev;
      const newBlueprint = { ...prev, ...details, updatedAt: new Date() };
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(newBlueprint));
      saveToDatabase(details);
      return newBlueprint;
    });
  }, [saveToDatabase]);

  // Submit the blueprint and trigger PDF generation + email delivery
  const submitBlueprint = useCallback(async (userDetails?: { firstName?: string; lastName?: string; userEmail?: string; businessName?: string }): Promise<{ success: boolean; pdfUrl?: string; scores?: { integrity: number; complexity: number; tier?: string } }> => {
    if (!blueprint?.id) return { success: false };

    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) {
      toast({
        title: 'Error',
        description: 'Session expired. Please refresh and try again.',
        variant: 'destructive',
      });
      return { success: false };
    }

    setIsSaving(true);

    try {
      // Generate PDF client-side and upload to storage for email attachment
      let pdfUrl: string | null = null;
      try {
        const { generateBlueprintPdfBlob } = await import('@/lib/generateBlueprintPdf');
        const { blob, filename } = generateBlueprintPdfBlob(blueprint);
        const storagePath = `pdfs/${blueprint.id}/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('blueprint-references')
          .upload(storagePath, blob, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (!uploadError) {
          // Get a signed URL valid for 7 days
          const { data: signedData } = await supabase.storage
            .from('blueprint-references')
            .createSignedUrl(storagePath, 60 * 60 * 24 * 30); // 30-day expiry for ops console
          pdfUrl = signedData?.signedUrl || null;
        } else {
          console.warn('[useBlueprint] PDF upload failed, continuing without attachment:', uploadError.message);
        }
      } catch (pdfErr) {
        console.warn('[useBlueprint] PDF generation failed, continuing without attachment:', pdfErr);
      }

      // Force-sync ALL data to DB before submission
      // User details come directly from the form (bypasses debounce race condition)
      const email = userDetails?.userEmail || blueprint.userEmail || null;
      const firstName = userDetails?.firstName || blueprint.firstName || null;
      const lastName = userDetails?.lastName || blueprint.lastName || null;
      const businessName = userDetails?.businessName || blueprint.businessName || null;

      const blueprintClient = getBlueprintClientWithToken(token);
      const { error: syncError } = await blueprintClient
        .from('blueprints')
        .update({
          status: 'draft',
          user_email: email,
          first_name: firstName,
          last_name: lastName,
          business_name: businessName,
          discovery: blueprint.discovery,
          design: blueprint.design,
          deliver: blueprint.deliver,
          dream_intent: blueprint.dreamIntent || null,
        })
        .eq('id', blueprint.id);
      console.log('[useBlueprint] Pre-submit sync result:', { syncError, email, firstName });

      if (syncError) {
        console.error('[useBlueprint] Pre-submit sync failed:', syncError);
      }

      // Call the atomic submit-blueprint Edge Function
      console.log('[useBlueprint] Invoking submit-blueprint with blueprint_id:', blueprint.id);
      const { data, error: invokeError } = await supabase.functions.invoke('submit-blueprint', {
        body: { blueprint_id: blueprint.id, pdf_url: pdfUrl }
      });
      console.log('[useBlueprint] Response:', { data, invokeError });

      if (invokeError || !data?.success) {
        const errorMsg = data?.errors?.join(', ') || data?.error || 'Submission failed';
        console.error('[useBlueprint] Submission failed:', { invokeError, data, errorMsg });
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        setIsSaving(false);
        return { success: false };
      }

      // Update local state with submitted status and scores
      setBlueprint(prev => prev ? {
        ...prev,
        status: 'submitted',
        submittedAt: new Date()
      } : prev);

      // Clear stored IDs and token so next visit creates fresh blueprint
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(DREAM_INTENT_KEY);
      localStorage.removeItem(LOCAL_DRAFT_KEY);

      setIsSaving(false);

      toast({
        title: 'Blueprint Submitted',
        description: 'Your Crafted Blueprint has been received. Check your email for next steps.',
      });

      return { success: true, scores: data.scores };
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setIsSaving(false);
      return { success: false };
    }
  }, [blueprint, toast]);

  // Reset to start fresh
  const resetBlueprint = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(DREAM_INTENT_KEY);
    localStorage.removeItem(LOCAL_DRAFT_KEY);
    setBlueprint(null);
    setIsLoading(true);
    isInitializingRef.current = false;
    // This will trigger the useEffect to create a new blueprint
    window.location.reload();
  }, []);

  // Confirm session to dismiss resume modal
  const confirmSession = useCallback(() => {
    setSessionStatus(prev => ({ ...prev, confirmed: true }));
  }, []);

  // Export session token getter for other components (e.g., ReferenceUploader)
  const getSessionToken = useCallback(() => {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  }, []);

  return {
    blueprint,
    isLoading,
    isSaving,
    sessionStatus,
    updateDiscovery,
    updateDesign,
    updateDeliver,
    updateDreamIntent,
    setCurrentStep,
    updateUserDetails,
    submitBlueprint,
    resetBlueprint,
    confirmSession,
    getSessionToken,
  };
}
