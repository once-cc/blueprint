import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link, X, FileImage, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Reference {
  id: string;
  type: 'image' | 'pdf' | 'link';
  url: string;
  filename?: string;
  notes?: string;
  storagePath?: string;
}

interface ReferenceUploaderProps {
  blueprintId: string;
  references: Reference[];
  onReferencesChange: (refs: Reference[]) => void;
}

// Get session token from localStorage for blueprint access
function getSessionToken(): string | null {
  return localStorage.getItem('blueprint_session_token');
}

export function ReferenceUploader({
  blueprintId,
  references,
  onReferencesChange,
}: ReferenceUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  const { toast } = useToast();

  // Generate signed URL for a file in blueprint-references bucket
  const getSignedUrl = async (storagePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('blueprint-references')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Failed to create signed URL:', error);
      return null;
    }

    return data.signedUrl;
  };

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const sessionToken = getSessionToken();

    try {
      const newRefs: Reference[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '');
        const isPdf = fileExt === 'pdf';

        if (!isImage && !isPdf) {
          toast({
            title: 'Invalid file type',
            description: `${file.name} is not a supported file type.`,
            variant: 'destructive',
          });
          continue;
        }

        // Upload to blueprint-references bucket (private)
        const fileName = `${blueprintId}/${Date.now()}-${file.name}`;
        
        const { data, error } = await supabase.storage
          .from('blueprint-references')
          .upload(fileName, file, {
            headers: sessionToken ? { 'x-blueprint-token': sessionToken } : undefined,
          });

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: 'Upload failed',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive',
          });
          continue;
        }

        // Get a signed URL for display (expires in 1 hour)
        const signedUrl = await getSignedUrl(data.path);
        if (!signedUrl) {
          toast({
            title: 'Upload failed',
            description: `Failed to get access URL for ${file.name}`,
            variant: 'destructive',
          });
          continue;
        }

        // Save to database with session token header
        const { data: refData, error: refError } = await supabase
          .from('blueprint_references')
          .insert({
            blueprint_id: blueprintId,
            type: isImage ? 'image' : 'pdf',
            url: signedUrl,
            filename: file.name,
            storage_path: data.path,
          })
          .select()
          .single();

        if (refData && !refError) {
          newRefs.push({
            id: refData.id,
            type: refData.type as 'image' | 'pdf',
            url: signedUrl,
            filename: refData.filename ?? undefined,
            notes: refData.notes ?? undefined,
            storagePath: refData.storage_path ?? undefined,
          });
        }
      }

      onReferencesChange([...references, ...newRefs]);

      if (newRefs.length > 0) {
        toast({
          title: 'Upload complete',
          description: `${newRefs.length} file(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'An error occurred while uploading files.',
        variant: 'destructive',
      });
    }

    setIsUploading(false);
  }, [blueprintId, references, onReferencesChange, toast]);

  const handleAddLink = async () => {
    if (!linkUrl.trim()) return;

    // Basic URL validation
    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      new URL(url);
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid website URL.',
        variant: 'destructive',
      });
      return;
    }

    const { data, error } = await supabase
      .from('blueprint_references')
      .insert({
        blueprint_id: blueprintId,
        type: 'link',
        url,
        filename: new URL(url).hostname,
      })
      .select()
      .single();

    if (data && !error) {
      onReferencesChange([
        ...references,
        {
          id: data.id,
          type: 'link',
          url: data.url,
          filename: data.filename ?? undefined,
        },
      ]);
      setLinkUrl('');
      toast({
        title: 'Link added',
        description: 'Website reference added successfully.',
      });
    }
  };

  const handleRemoveReference = async (refId: string) => {
    const ref = references.find(r => r.id === refId);
    
    // Delete from storage if it's an uploaded file with storage path
    if (ref?.type !== 'link' && ref?.storagePath) {
      const sessionToken = getSessionToken();
      await supabase.storage
        .from('blueprint-references')
        .remove([ref.storagePath]);
    }

    await supabase
      .from('blueprint_references')
      .delete()
      .eq('id', refId);

    onReferencesChange(references.filter(r => r.id !== refId));
  };

  const handleUpdateNotes = async (refId: string, notes: string) => {
    await supabase
      .from('blueprint_references')
      .update({ notes })
      .eq('id', refId);

    onReferencesChange(
      references.map(r => (r.id === refId ? { ...r, notes } : r))
    );
  };

  // Refresh signed URL if needed (for expired URLs)
  const getDisplayUrl = useCallback(async (ref: Reference): Promise<string> => {
    if (ref.type === 'link') {
      return ref.url;
    }
    
    // For uploaded files, the stored URL might be expired
    // In production, you'd want to refresh these on demand
    if (ref.storagePath) {
      const signedUrl = await getSignedUrl(ref.storagePath);
      return signedUrl || ref.url;
    }
    
    return ref.url;
  }, []);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'upload'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Files
        </button>
        <button
          onClick={() => setActiveTab('link')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'link'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Link className="w-4 h-4" />
          Add Website
        </button>
      </div>

      {/* Upload Zone */}
      {activeTab === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <label
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
              isUploading
                ? 'border-accent/50 bg-accent/5'
                : 'border-border/50 hover:border-accent/50 hover:bg-accent/5'
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex items-center gap-2 text-accent">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-medium">Uploading...</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drop images or PDFs here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Max 10MB per file
                </p>
              </>
            )}
          </label>
        </motion.div>
      )}

      {/* Link Input */}
      {activeTab === 'link' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          <Input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
          />
          <Button onClick={handleAddLink} disabled={!linkUrl.trim()}>
            Add
          </Button>
        </motion.div>
      )}

      {/* References List */}
      <AnimatePresence mode="popLayout">
        {references.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-muted-foreground">
              Added References ({references.length})
            </h4>
            {references.map((ref) => (
              <motion.div
                key={ref.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
                className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/30"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                  {ref.type === 'image' ? (
                    <FileImage className="w-5 h-5 text-accent" />
                  ) : ref.type === 'pdf' ? (
                    <FileText className="w-5 h-5 text-accent" />
                  ) : (
                    <ExternalLink className="w-5 h-5 text-accent" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {ref.filename || ref.url}
                  </p>
                  <Textarea
                    placeholder="Add notes about this reference..."
                    value={ref.notes || ''}
                    onChange={(e) => handleUpdateNotes(ref.id, e.target.value)}
                    className="mt-2 text-xs min-h-[60px] resize-none"
                  />
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveReference(ref.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
