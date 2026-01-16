import { useState, useCallback, forwardRef, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { BlueprintReference, ReferenceRole } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Upload, Link as LinkIcon, Image, FileText, X, 
  Plus, ExternalLink, Loader2, Palette, Type, Layout, Sparkles, Maximize2,
  LayoutGrid, List, GripVertical, Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Constants
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const SESSION_TOKEN_KEY = 'blueprint_session_token';

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Factory to create a token-scoped Supabase client for reference operations
const createBlueprintClient = () => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) return null;
  
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      global: { 
        headers: { 'x-blueprint-token': token } 
      }
    }
  );
};

interface ReferencesStepProps {
  blueprintId: string;
  references: BlueprintReference[];
  onReferencesChange: (refs: BlueprintReference[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const roleOptions: { id: ReferenceRole; label: string; icon: React.ElementType }[] = [
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
    const [savingNotes, setSavingNotes] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});
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
      
      const blueprintClient = createBlueprintClient();
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

      const blueprintClient = createBlueprintClient();
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

    const handleRemove = async (ref: BlueprintReference) => {
      const blueprintClient = createBlueprintClient();
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
      const blueprintClient = createBlueprintClient();
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
      setSavingNotes(prev => ({ ...prev, [refItem.id]: 'saving' }));
      
      // Clear any pending timeouts for this reference
      if (notesTimeoutRef.current[refItem.id]) {
        clearTimeout(notesTimeoutRef.current[refItem.id]);
      }
      if (savedTimeoutRef.current[refItem.id]) {
        clearTimeout(savedTimeoutRef.current[refItem.id]);
      }
      
      // Debounce database save (500ms delay)
      notesTimeoutRef.current[refItem.id] = setTimeout(async () => {
        const blueprintClient = createBlueprintClient();
        if (!blueprintClient) {
          setSavingNotes(prev => ({ ...prev, [refItem.id]: 'idle' }));
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
          setSavingNotes(prev => ({ ...prev, [refItem.id]: 'saved' }));
          
          // Reset to idle after 2 seconds
          savedTimeoutRef.current[refItem.id] = setTimeout(() => {
            setSavingNotes(prev => ({ ...prev, [refItem.id]: 'idle' }));
          }, 2000);
        } catch (error) {
          toast.error('Failed to update notes');
          setSavingNotes(prev => ({ ...prev, [refItem.id]: 'idle' }));
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

    return (
      <StepLayout
        ref={ref}
        act="deliver"
      stepNumber={9}
      title="References"
      framing="Share any inspiration or examples you love."
      helperText="Upload images, PDFs, or paste links to websites that capture the vibe you're going for."
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
              'relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all duration-200',
              isDragging
                ? 'border-accent bg-accent/10'
                : 'border-border/50 hover:border-accent/50 bg-card/30'
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
                <p className="text-xs text-muted-foreground mt-1">
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
            className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-border/50 bg-card/30"
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
              <p className="text-xs text-muted-foreground">
                Drag to reorder • Most important references first
              </p>

              {/* List View with Drag & Drop */}
              {viewMode === 'list' && (
                <Reorder.Group
                  axis="y"
                  values={references}
                  onReorder={onReferencesChange}
                  className="space-y-3"
                >
                  {references.map((ref) => (
                    <Reorder.Item
                      key={ref.id}
                      value={ref}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <motion.div
                        layout="position"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-4 p-4 rounded-xl border border-border/50 bg-card/30 group"
                      >
                        {/* Drag Handle */}
                        <div className="flex items-center shrink-0">
                          <GripVertical className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                        </div>
                        
                        {/* Preview */}
                        <div 
                          className={cn(
                            "w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center relative",
                            ref.type === 'image' && "cursor-pointer"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (ref.type === 'image') setLightboxImage(ref);
                          }}
                        >
                          {ref.type === 'image' ? (
                            <>
                              <img
                                src={getDisplayUrl(ref)}
                                alt={ref.filename || 'Reference'}
                                className="w-full h-full object-cover transition-transform hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center">
                                <Maximize2 className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition-opacity" />
                              </div>
                            </>
                          ) : ref.type === 'pdf' ? (
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          ) : (
                            <ExternalLink className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {ref.filename || ref.url}
                              </p>
                              {ref.type === 'link' && (
                                <a
                                  href={ref.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-accent hover:underline flex items-center gap-1"
                                >
                                  Open link <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(ref);
                              }}
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <div onPointerDownCapture={(e) => e.stopPropagation()}>
                              <Select
                                value={ref.role || 'other'}
                                onValueChange={(value) => handleUpdateRole(ref, value as ReferenceRole)}
                              >
                                <SelectTrigger 
                                  className="w-full sm:w-44 h-8 text-xs"
                                  onClick={(e) => e.stopPropagation()}
                                  onPointerDown={(e) => e.stopPropagation()}
                                >
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roleOptions.map((option) => (
                                    <SelectItem key={option.id} value={option.id}>
                                      <span className="flex items-center gap-2">
                                        <option.icon className="w-3 h-3" />
                                        {option.label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div 
                              className="flex-1 relative"
                              onPointerDownCapture={(e) => e.stopPropagation()}
                            >
                              <Textarea
                                value={localNotes[ref.id] ?? ref.notes ?? ''}
                                onChange={(e) => handleNotesChange(ref, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                placeholder="Add notes..."
                                className="min-h-[32px] h-8 text-xs resize-none w-full pr-16"
                              />
                              {/* Auto-save indicator */}
                              <AnimatePresence mode="wait">
                                {savingNotes[ref.id] === 'saving' && (
                                  <motion.div
                                    key="saving"
                                    initial={{ opacity: 0, x: 4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground"
                                  >
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span className="text-[10px]">Saving...</span>
                                  </motion.div>
                                )}
                                {savingNotes[ref.id] === 'saved' && (
                                  <motion.div
                                    key="saved"
                                    initial={{ opacity: 0, x: 4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-accent"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span className="text-[10px]">Saved</span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}

              {/* Grid View with Drag & Drop */}
              {viewMode === 'grid' && (
                <Reorder.Group
                  axis="y"
                  values={references}
                  onReorder={onReferencesChange}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                >
                  {references.map((ref) => {
                    const RoleIcon = roleOptions.find(r => r.id === ref.role)?.icon || FileText;
                    return (
                      <Reorder.Item
                        key={ref.id}
                        value={ref}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <motion.div
                          layout="position"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative aspect-square rounded-xl border border-border/50 bg-card/30 overflow-hidden group"
                        >
                          {/* Thumbnail */}
                          {ref.type === 'image' ? (
                            <img
                              src={getDisplayUrl(ref)}
                              alt={ref.filename || 'Reference'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted/20">
                              {ref.type === 'pdf' ? (
                                <FileText className="w-10 h-10 text-muted-foreground" />
                              ) : (
                                <ExternalLink className="w-10 h-10 text-muted-foreground" />
                              )}
                            </div>
                          )}

                          {/* Role Badge */}
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5 flex items-center gap-1">
                            <RoleIcon className="w-3 h-3 text-white/80" />
                            <span className="text-[10px] text-white/80 font-medium truncate max-w-[60px]">
                              {roleOptions.find(r => r.id === ref.role)?.label || 'Other'}
                            </span>
                          </div>

                          {/* Drag Handle */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4 text-white drop-shadow-md" />
                          </div>

                          {/* Hover Overlay with Actions */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            {ref.type === 'image' && (
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white border-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxImage(ref);
                                }}
                              >
                                <Maximize2 className="w-4 h-4" />
                              </Button>
                            )}
                            {ref.type === 'link' && (
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white border-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(ref.url, '_blank');
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(ref);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Filename on hover */}
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white/90 truncate">
                              {ref.filename || new URL(ref.url).hostname}
                            </p>
                          </div>
                        </motion.div>
                      </Reorder.Item>
                    );
                  })}
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
