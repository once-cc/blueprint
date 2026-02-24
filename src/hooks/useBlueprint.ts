import { useState, useEffect, useCallback, useRef } from 'react';
import { getBlueprintClientWithToken, clearBlueprintClient } from '@/lib/blueprintClient';
import { supabase } from '@/integrations/supabase/client';
import { Blueprint, BlueprintDiscovery, BlueprintDesign, BlueprintDeliver } from '@/types/blueprint';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'blueprint_id';
const SESSION_TOKEN_KEY = 'blueprint_session_token';
const DREAM_INTENT_KEY = 'dream_intent';
const DEBOUNCE_MS = 1000;



// Helper to map database row to Blueprint type
const mapDbToBlueprint = (
  data: Record<string, unknown>,
  storedDreamIntent?: string | null
): Blueprint => ({
  id: data.id as string,
  status: data.status as Blueprint['status'],
  userEmail: (data.user_email as string) ?? undefined,
  firstName: (data.first_name as string) ?? undefined,
  lastName: (data.last_name as string) ?? undefined,
  businessName: (data.business_name as string) ?? undefined,
  dreamIntent: (data.dream_intent as string) ?? storedDreamIntent ?? undefined,
  discovery: (data.discovery as BlueprintDiscovery) || {},
  design: (data.design as BlueprintDesign) || {},
  deliver: (data.deliver as BlueprintDeliver) || {},
  pdfUrl: (data.pdf_url as string) ?? undefined,
  currentStep: data.current_step as number,
  createdAt: new Date(data.created_at as string),
  updatedAt: new Date(data.updated_at as string),
  submittedAt: data.submitted_at ? new Date(data.submitted_at as string) : undefined,
});

export function useBlueprint() {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<{
    hasExisting: boolean;
    confirmed: boolean;
  }>({ hasExisting: false, confirmed: false });
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);

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
        // Fall through to create new blueprint
      }

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
          const hasProgress = (data.current_step as number) > 1 ||
            (data as Record<string, unknown>).dream_intent ||
            storedDreamIntent;

          setBlueprint(mapDbToBlueprint(data as Record<string, unknown>, storedDreamIntent));
          setSessionStatus({ hasExisting: !!hasProgress, confirmed: !hasProgress });
          await finishLoading();
          return;
        }

        // Load failed - log and clear ALL storage
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(DREAM_INTENT_KEY);
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

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);

      const dbUpdates: Record<string, unknown> = {};
      if (updates.discovery !== undefined) dbUpdates.discovery = updates.discovery;
      if (updates.design !== undefined) dbUpdates.design = updates.design;
      if (updates.deliver !== undefined) dbUpdates.deliver = updates.deliver;
      if (updates.dreamIntent !== undefined) dbUpdates.dream_intent = updates.dreamIntent;
      if (updates.currentStep !== undefined) dbUpdates.current_step = updates.currentStep;
      if (updates.userEmail !== undefined) dbUpdates.user_email = updates.userEmail;
      if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
      if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.submittedAt !== undefined) dbUpdates.submitted_at = updates.submittedAt.toISOString();

      const blueprintClient = getBlueprintClientWithToken(token);
      const { error } = await blueprintClient
        .from('blueprints')
        .update(dbUpdates)
        .eq('id', blueprint.id);

      if (error) {
      }

      setIsSaving(false);
    }, DEBOUNCE_MS);
  }, [blueprint?.id]);

  // Update discovery data
  const updateDiscovery = useCallback((updates: Partial<BlueprintDiscovery>) => {
    setBlueprint(prev => {
      if (!prev) return prev;
      const newDiscovery = { ...prev.discovery, ...updates };
      saveToDatabase({ discovery: newDiscovery });
      return { ...prev, discovery: newDiscovery, updatedAt: new Date() };
    });
  }, [saveToDatabase]);

  // Update design data
  const updateDesign = useCallback((updates: Partial<BlueprintDesign>) => {
    setBlueprint(prev => {
      if (!prev) return prev;
      const newDesign = { ...prev.design, ...updates };
      saveToDatabase({ design: newDesign });
      return { ...prev, design: newDesign, updatedAt: new Date() };
    });
  }, [saveToDatabase]);

  // Update deliver data
  const updateDeliver = useCallback((updates: Partial<BlueprintDeliver>) => {
    setBlueprint(prev => {
      if (!prev) return prev;
      const newDeliver = { ...prev.deliver, ...updates };
      saveToDatabase({ deliver: newDeliver });
      return { ...prev, deliver: newDeliver, updatedAt: new Date() };
    });
  }, [saveToDatabase]);

  // Update dream intent
  const updateDreamIntent = useCallback((dreamIntent: string) => {
    localStorage.setItem(DREAM_INTENT_KEY, dreamIntent);
    setBlueprint(prev => {
      if (!prev) return prev;
      saveToDatabase({ dreamIntent });
      return { ...prev, dreamIntent, updatedAt: new Date() };
    });
  }, [saveToDatabase]);

  // Update current step
  const setCurrentStep = useCallback((step: number) => {
    setBlueprint(prev => {
      if (!prev) return prev;
      saveToDatabase({ currentStep: step });
      return { ...prev, currentStep: step };
    });
  }, [saveToDatabase]);

  // Update user details
  const updateUserDetails = useCallback((details: { firstName?: string; lastName?: string; userEmail?: string; businessName?: string }) => {
    setBlueprint(prev => {
      if (!prev) return prev;
      saveToDatabase(details);
      return { ...prev, ...details };
    });
  }, [saveToDatabase]);

  // Submit the blueprint and trigger PDF generation + email delivery
  const submitBlueprint = useCallback(async (): Promise<{ success: boolean; pdfUrl?: string; scores?: { integrity: number; complexity: number; tier?: string } }> => {
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
            .createSignedUrl(storagePath, 60 * 60 * 24 * 7);
          pdfUrl = signedData?.signedUrl || null;
        } else {
          console.warn('[useBlueprint] PDF upload failed, continuing without attachment:', uploadError.message);
        }
      } catch (pdfErr) {
        console.warn('[useBlueprint] PDF generation failed, continuing without attachment:', pdfErr);
      }

      // Call the atomic submit-blueprint Edge Function
      const { data, error: invokeError } = await supabase.functions.invoke('submit-blueprint', {
        body: { blueprint_id: blueprint.id, pdf_url: pdfUrl }
      });

      if (invokeError || !data?.success) {
        const errorMsg = data?.errors?.join(', ') || data?.error || 'Submission failed';
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
  }, [blueprint?.id, blueprint?.userEmail, toast]);

  // Reset to start fresh
  const resetBlueprint = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(DREAM_INTENT_KEY);
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
