import { useState, useCallback, forwardRef, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { BlueprintReference, ReferenceRole } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReferenceListItem } from '../ui/ReferenceListItem';
import { ReferenceGridItem } from '../ui/ReferenceGridItem';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Upload, Link as LinkIcon, Image, FileText, X,
  Plus, ExternalLink, Loader2, Palette, Type, Layout, Sparkles, Maximize2,
  LayoutGrid, List, GripVertical, Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getBlueprintClient } from '@/lib/blueprintClient';
import { toast } from 'sonner';

// Constants
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};


interface ReferencesStepProps {
  blueprintId: string;
  references: BlueprintReference[];
  onReferencesChange: (refs: BlueprintReference[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const ROLE_OPTIONS: { id: ReferenceRole; label: string; icon: React.ElementType }[] = [
  { id: 'hero_reference', label: 'Hero Inspiration', icon: Layout },
  { id: 'layout_reference', label: 'Layout Reference', icon: Layout },
  { id: 'colour_reference', label: 'Colour Reference', icon: Palette },
  { id: 'typography_reference', label: 'Typography Reference', icon: Type },
  { id: 'overall_vibe', label: 'Overall Vibe', icon: Sparkles },
  { id: 'other', label: 'Other', icon: FileText },
];

export const ReferencesStep = forwardRef<HTMLDivElement, ReferencesStepProps>(
  function ReferencesStep({
    blueprintId,
    references,
    onReferencesChange,
    onBack,
    onNext
  }, ref) {
    const [isUploading, setIsUploading] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // View mode state
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Lightbox state
    const [lightboxImage, setLightboxImage] = useState<BlueprintReference | null>(null);

    // Upload progress state
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentFileName, setCurrentFileName] = useState('');
    const [totalFiles, setTotalFiles] = useState(0);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);

    // Local notes state for debounced saving
    const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
    const [savingStatus, setSavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});
    const notesTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
    const savedTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

    // Refreshed signed URLs for display
    const [refreshedUrls, setRefreshedUrls] = useState<Record<string, string>>({});

    // Initialize local notes from references
    useEffect(() => {
      const initialNotes: Record<string, string> = {};
      references.forEach(refItem => {
        if (localNotes[refItem.id] === undefined) {
          initialNotes[refItem.id] = refItem.notes || '';
        }
      });
      if (Object.keys(initialNotes).length > 0) {
        setLocalNotes(prev => ({ ...prev, ...initialNotes }));
      }
    }, [references]);

    // Refresh signed URLs for uploaded files on mount and when references change
    useEffect(() => {
      const refreshUrls = async () => {
        const urlMap: Record<string, string> = {};
        for (const refItem of references) {
          if (refItem.storagePath && refItem.type !== 'link') {
            const { data } = await supabase.storage
              .from('blueprint-references')
              .createSignedUrl(refItem.storagePath, 3600);
            if (data?.signedUrl) {
              urlMap[refItem.id] = data.signedUrl;

              // Preload the image silently for faster thumbnail rendering
              if (refItem.type === 'image') {
                const img = document.createElement('img');
                img.src = data.signedUrl;
              }
            }
          }
        }
        if (Object.keys(urlMap).length > 0) {
          setRefreshedUrls(urlMap);
        }
      };
      if (references.length > 0) {
        refreshUrls();
      }
    }, [references]);

    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => {
        Object.values(notesTimeoutRef.current).forEach(clearTimeout);
        Object.values(savedTimeoutRef.current).forEach(clearTimeout);
      };
    }, []);

    // Helper to get display URL (use refreshed URL if available)
    const getDisplayUrl = (refItem: BlueprintReference) => {
      if (refItem.storagePath && refreshedUrls[refItem.id]) {
        return refreshedUrls[refItem.id];
      }
      return refItem.url;
    };

    const handleFileUpload = useCallback(async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const blueprintClient = getBlueprintClient();
      if (!blueprintClient) {
        toast.error('Session expired. Please refresh the page.');
        return;
      }

      const fileArray = Array.from(files);
      const failedFiles: string[] = [];

      // Validate file sizes first
      const validFiles: File[] = [];
      for (const file of fileArray) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds the 20MB limit (${formatFileSize(file.size)})`);
          continue;
        }

        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
          toast.error(`${file.name} is not a supported file type`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      setIsUploading(true);
      setTotalFiles(validFiles.length);
      setUploadProgress(0);

      const newRefs: BlueprintReference[] = [];

      try {
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          setCurrentFileIndex(i + 1);
          setCurrentFileName(file.name);
          setUploadProgress((i / validFiles.length) * 100);

          const isImage = file.type.startsWith('image/');

          const fileExt = file.name.split('.').pop();
          const fileName = `${blueprintId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          // Upload to storage with explicit MIME type
          const { error: uploadError } = await supabase.storage
            .from('blueprint-references')
            .upload(fileName, file, {
              contentType: file.type,
            });

          if (uploadError) {
            console.error('[References] Storage upload failed:', uploadError);
            toast.error(`Failed to upload ${file.name}`);
            failedFiles.push(file.name);
            continue;
          }

          // Get signed URL (bucket is private)
          const { data: signedData, error: signedError } = await supabase.storage
            .from('blueprint-references')
            .createSignedUrl(fileName, 3600);

          if (signedError || !signedData?.signedUrl) {
            console.error('[References] Failed to create signed URL:', signedError);
            toast.error(`Failed to process ${file.name}`);
            failedFiles.push(file.name);
            // Clean up orphaned storage file
            await supabase.storage.from('blueprint-references').remove([fileName]);
            continue;
          }

          // Use token-scoped client for database insert (RLS requires the token header)
          const { data: refData, error: insertError } = await blueprintClient
            .from('blueprint_references')
            .insert({
              blueprint_id: blueprintId,
              type: isImage ? 'image' : 'pdf',
              url: signedData.signedUrl,
              filename: file.name,
              storage_path: fileName,
              role: 'overall_vibe',
            })
            .select()
            .single();

          if (insertError) {
            console.error('[References] Database insert failed:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
            });
            toast.error(`Failed to save ${file.name}`);
            failedFiles.push(file.name);
            // Clean up orphaned storage file
            await supabase.storage.from('blueprint-references').remove([fileName]);
            continue;
          }

          newRefs.push({
            id: refData.id,
            blueprintId: refData.blueprint_id,
            type: refData.type as 'image' | 'pdf',
            url: signedData.signedUrl,
            filename: refData.filename || undefined,
            storagePath: refData.storage_path || undefined,
            role: (refData.role as ReferenceRole) || 'other',
            notes: refData.notes || undefined,
            createdAt: new Date(refData.created_at),
          });

          // Store refreshed URL
          setRefreshedUrls(prev => ({ ...prev, [refData.id]: signedData.signedUrl }));

          // Update progress after successful upload
          setUploadProgress(((i + 1) / validFiles.length) * 100);
        }

        if (newRefs.length > 0) {
          onReferencesChange([...references, ...newRefs]);
          toast.success(`Uploaded ${newRefs.length} file(s)`);
        }

        if (failedFiles.length > 0 && newRefs.length > 0) {
          // Some succeeded, some failed - already showed individual errors
        }
      } catch (error) {
        console.error('[References] Unexpected error:', error);
        toast.error('Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        setCurrentFileName('');
        setTotalFiles(0);
        setCurrentFileIndex(0);
      }
    }, [blueprintId, references, onReferencesChange]);

    const handleAddLink = async () => {
      if (!linkUrl.trim()) return;

      const blueprintClient = getBlueprintClient();
      if (!blueprintClient) {
        toast.error('Session expired. Please refresh the page.');
        return;
      }

      let url = linkUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      try {
        new URL(url);
      } catch {
        toast.error('Please enter a valid URL');
        return;
      }

      setIsUploading(true);

      try {
        const { data: refData, error } = await blueprintClient
          .from('blueprint_references')
          .insert({
            blueprint_id: blueprintId,
            type: 'link',
            url,
            role: 'overall_vibe',
          })
          .select()
          .single();

        if (error) {
          console.error('[References] Link insert failed:', error);
          throw error;
        }

        const newRef: BlueprintReference = {
          id: refData.id,
          blueprintId: refData.blueprint_id,
          type: 'link',
          url: refData.url,
          role: (refData.role as ReferenceRole) || 'other',
          notes: refData.notes || undefined,
          createdAt: new Date(refData.created_at),
        };

        onReferencesChange([...references, newRef]);
        setLinkUrl('');
        toast.success('Link added');
      } catch (error) {
        toast.error('Failed to add link. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };

    const handleRemoveReference = async (ref: BlueprintReference) => {
      const blueprintClient = getBlueprintClient();
      if (!blueprintClient) {
        toast.error('Session expired. Please refresh the page.');
        return;
      }

      try {
        // Delete from database first (requires token)
        const { error: deleteError } = await blueprintClient
          .from('blueprint_references')
          .delete()
          .eq('id', ref.id);

        if (deleteError) {
          console.error('[References] Delete failed:', deleteError);
          throw deleteError;
        }

        // Then delete from storage
        if (ref.storagePath) {
          await supabase.storage
            .from('blueprint-references')
            .remove([ref.storagePath]);
        }

        onReferencesChange(references.filter(r => r.id !== ref.id));
        toast.success('Reference removed');
      } catch (error) {
        toast.error('Failed to remove reference');
      }
    };

    const handleUpdateRole = async (ref: BlueprintReference, role: ReferenceRole) => {
      const blueprintClient = getBlueprintClient();
      if (!blueprintClient) {
        toast.error('Session expired. Please refresh the page.');
        return;
      }

      try {
        const { error } = await blueprintClient
          .from('blueprint_references')
          .update({ role })
          .eq('id', ref.id);

        if (error) {
          console.error('[References] Update role failed:', error);
          throw error;
        }

        onReferencesChange(
          references.map(r => r.id === ref.id ? { ...r, role } : r)
        );
      } catch (error) {
        toast.error('Failed to update role');
      }
    };

    const handleNotesChange = useCallback((refItem: BlueprintReference, notes: string) => {
      // Update local state immediately for responsive UI
      setLocalNotes(prev => ({ ...prev, [refItem.id]: notes }));

      // Set saving state
      setSavingStatus(prev => ({ ...prev, [refItem.id]: 'saving' }));

      // Clear any pending timeouts for this reference
      if (notesTimeoutRef.current[refItem.id]) {
        clearTimeout(notesTimeoutRef.current[refItem.id]);
      }
      if (savedTimeoutRef.current[refItem.id]) {
        clearTimeout(savedTimeoutRef.current[refItem.id]);
      }

      // Debounce database save (500ms delay)
      notesTimeoutRef.current[refItem.id] = setTimeout(async () => {
        const blueprintClient = getBlueprintClient();
        if (!blueprintClient) {
          setSavingStatus(prev => ({ ...prev, [refItem.id]: 'idle' }));
          return;
        }

        try {
          const { error } = await blueprintClient
            .from('blueprint_references')
            .update({ notes })
            .eq('id', refItem.id);

          if (error) {
            console.error('[References] Update notes failed:', error);
            throw error;
          }

          // Update parent state only after successful save
          onReferencesChange(
            references.map(r => r.id === refItem.id ? { ...r, notes } : r)
          );

          // Set saved state
          setSavingStatus(prev => ({ ...prev, [refItem.id]: 'saved' }));

          // Reset to idle after 2 seconds
          savedTimeoutRef.current[refItem.id] = setTimeout(() => {
            setSavingStatus(prev => ({ ...prev, [refItem.id]: 'idle' }));
          }, 2000);
        } catch (error) {
          toast.error('Failed to update notes');
          setSavingStatus(prev => ({ ...prev, [refItem.id]: 'idle' }));
        }
      }, 500);
    }, [references, onReferencesChange]);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    };

    const handleReorder = useCallback((newOrder: BlueprintReference[]) => {
      onReferencesChange(newOrder);
    }, [onReferencesChange]);

    return (
      <StepLayout
        ref={ref}
        act="deliver"
        stepNumber={9}
        title="References"
        framing="Share any inspiration or examples you love."
        onBack={onBack}
        onNext={onNext}
      >
        <div className="space-y-8">
          {/* Upload Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all duration-[220ms] ease-out cfg-surface backdrop-blur-sm',
                isDragging
                  ? 'border-accent/50 bg-accent/10 cfg-surface-selected'
                  : 'border-border/40 hover:border-accent/50 bg-card/80 dark:border-border/50 hover:bg-card/90'
              )}
            >
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-3 w-full px-4">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  <div className="w-full max-w-[200px] space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center truncate">
                      {currentFileIndex}/{totalFiles}: {currentFileName}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">Upload Files</p>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Images or PDFs • Max 20MB • Drag & drop
                  </p>
                </>
              )}
            </motion.div>

            {/* Link Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all duration-[220ms] ease-out cfg-surface bg-card/80 backdrop-blur-sm border-border/40 dark:border-border/50 hover:border-border"
            >
              <LinkIcon className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-3">Add Website Link</p>
              <div className="flex gap-2 w-full max-w-xs">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                />
                <Button
                  size="sm"
                  onClick={handleAddLink}
                  disabled={!linkUrl.trim() || isUploading}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* References List */}
          <AnimatePresence mode="popLayout">
            {references.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Header with view toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    Your References ({references.length})
                  </Label>
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "h-7 w-7 p-0 transition-colors",
                        viewMode === 'list'
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        "h-7 w-7 p-0 transition-colors",
                        viewMode === 'grid'
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Drag hint */}
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Drag to reorder • Most important references first
                </p>

                {/* List View with Drag & Drop */}
                {viewMode === 'list' && (
                  <Reorder.Group
                    axis="y"
                    values={references}
                    onReorder={handleReorder}
                    className="space-y-3"
                  >
                    {references.map((ref) => (
                      <ReferenceListItem
                        key={ref.id}
                        refItem={ref}
                        roleOptions={ROLE_OPTIONS}
                        localNotes={localNotes[ref.id] ?? ref.notes ?? ''}
                        savingStatus={savingStatus[ref.id]}
                        getDisplayUrl={getDisplayUrl}
                        onRemove={handleRemoveReference}
                        onUpdateRole={handleUpdateRole}
                        onNotesChange={handleNotesChange}
                        onLightboxOpen={setLightboxImage}
                      />
                    ))}
                  </Reorder.Group>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && (
                  <Reorder.Group
                    axis="x"
                    values={references}
                    onReorder={handleReorder}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                  >
                    {references.map((ref) => (
                      <ReferenceGridItem
                        key={ref.id}
                        refItem={ref}
                        roleOptions={ROLE_OPTIONS}
                        localNotes={localNotes[ref.id] ?? ref.notes ?? ''}
                        savingStatus={savingStatus[ref.id]}
                        getDisplayUrl={getDisplayUrl}
                        onRemove={handleRemoveReference}
                        onUpdateRole={handleUpdateRole}
                        onNotesChange={handleNotesChange}
                        onLightboxOpen={setLightboxImage}
                      />
                    ))}
                  </Reorder.Group>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {references.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No references added yet</p>
              <p className="text-xs mt-1">Upload images, PDFs, or add website links for inspiration</p>
            </motion.div>
          )}
        </div>

        {/* Lightbox Modal */}
        <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-black/95 border-border/20">
            <DialogTitle className="sr-only">
              {lightboxImage?.filename || 'Image Preview'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Full size preview of the reference image
            </DialogDescription>
            {lightboxImage && (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={getDisplayUrl(lightboxImage)}
                  alt={lightboxImage.filename || 'Reference'}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                />
                <p className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/50 px-2 py-1 rounded">
                  {lightboxImage.filename}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </StepLayout>
    );
  }
);
