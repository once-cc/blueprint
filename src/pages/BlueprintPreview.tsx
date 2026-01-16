import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BlueprintDocument } from '@/components/blueprint-preview/BlueprintDocument';
import { buildBlueprintContract, BlueprintDataContract } from '@/lib/blueprintDataContract';
import { Blueprint, BlueprintDiscovery, BlueprintDesign, BlueprintDeliver, BlueprintReference } from '@/types/blueprint';
import { Loader2, ShieldAlert, Clock } from 'lucide-react';

export default function BlueprintPreview() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<BlueprintDataContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'expired' | 'not_found' | 'unauthorized' | 'generic'>('generic');
  
  // Support both /blueprint-preview/:id and /blueprint/pdf-preview?blueprint_id=xyz
  const blueprintId = id || searchParams.get('blueprint_id');
  const accessToken = searchParams.get('token');

  useEffect(() => {
    const fetchBlueprint = async () => {
      if (!blueprintId) {
        setError('No blueprint ID provided');
        setErrorType('not_found');
        setIsLoading(false);
        return;
      }

      if (!accessToken) {
        setError('Access token required');
        setErrorType('unauthorized');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch blueprint via secure edge function
        const { data, error: fetchError } = await supabase.functions.invoke('get-blueprint-preview', {
          body: { blueprint_id: blueprintId, token: accessToken }
        });

        if (fetchError) {
          console.error('[BlueprintPreview] Edge function error:', fetchError);
          setError('Failed to load blueprint');
          setErrorType('generic');
          setIsLoading(false);
          return;
        }

        if (data?.error) {
          console.error('[BlueprintPreview] Access denied:', data.error);
          if (data.error.includes('expired')) {
            setError('This preview link has expired');
            setErrorType('expired');
          } else if (data.error.includes('Invalid')) {
            setError('Invalid access link');
            setErrorType('unauthorized');
          } else {
            setError(data.error);
            setErrorType('not_found');
          }
          setIsLoading(false);
          return;
        }

        if (!data?.blueprint) {
          setError('Blueprint not found');
          setErrorType('not_found');
          setIsLoading(false);
          return;
        }

        // Transform blueprint data (already sanitized by edge function)
        const blueprintData = data.blueprint;
        const blueprint: Blueprint = {
          id: blueprintData.id,
          status: 'submitted' as Blueprint['status'],
          businessName: blueprintData.business_name ?? undefined,
          dreamIntent: blueprintData.dream_intent ?? undefined,
          discovery: (blueprintData.discovery as BlueprintDiscovery) || {},
          design: (blueprintData.design as BlueprintDesign) || {},
          deliver: (blueprintData.deliver as BlueprintDeliver) || {},
          currentStep: 5, // Submitted blueprints are complete
          createdAt: new Date(blueprintData.created_at),
          updatedAt: new Date(blueprintData.created_at),
          submittedAt: blueprintData.submitted_at ? new Date(blueprintData.submitted_at) : undefined,
        };

        // Transform references (already have signed URLs from edge function)
        const references: BlueprintReference[] = (data.references || []).map((ref: Record<string, unknown>) => ({
          id: ref.id as string,
          blueprintId: ref.blueprint_id as string,
          type: ref.type as BlueprintReference['type'],
          url: ref.url as string,
          filename: (ref.filename as string) ?? undefined,
          notes: (ref.notes as string) ?? undefined,
          storagePath: (ref.storage_path as string) ?? undefined,
          role: ref.role as BlueprintReference['role'],
          label: (ref.label as string) ?? undefined,
          createdAt: new Date(ref.created_at as string),
        }));

        // Build canonical contract
        const canonicalContract = buildBlueprintContract(blueprint, references);
        setContract(canonicalContract);
      } catch (err) {
        console.error('[BlueprintPreview] Unexpected error:', err);
        setError('Failed to load blueprint');
        setErrorType('generic');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlueprint();
  }, [blueprintId, accessToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground font-light">Loading Blueprint...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center max-w-md px-6">
          {/* Error icon based on type */}
          {errorType === 'expired' ? (
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-6" />
          ) : errorType === 'unauthorized' ? (
            <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-6" />
          ) : null}
          
          <h1 className="text-2xl font-light text-foreground mb-4">
            {errorType === 'expired' ? 'Link Expired' : 
             errorType === 'unauthorized' ? 'Access Denied' :
             'Blueprint Not Found'}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {error || 'Unable to load this blueprint.'}
          </p>
          
          {errorType === 'expired' && (
            <p className="text-sm text-muted-foreground/70 mb-6">
              For security, preview links expire after 7 days. 
              Please contact the studio for a new access link.
            </p>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-sm hover:opacity-90 transition-opacity"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return <BlueprintDocument contract={contract} />;
}
