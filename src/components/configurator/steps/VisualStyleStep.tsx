import { useState, useCallback, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { BlueprintDesign, BrandAsset, BrandAssetType } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { ConfiguratorModuleTitle } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Minimize2, Film, Building2, Crown, Sparkles, Cpu, CheckCircle2, AlertCircle, Image as ImageIcon, LayoutGrid, List, Camera, PenTool, Package, Clapperboard, Circle } from 'lucide-react';
import { springConfig, cardHover, cardTap, getContentShift, getIconAnimation } from '../ui/animationConfig';
import { BrandAssetListItem } from '../ui/BrandAssetListItem';
import { BrandAssetGridItem } from '../ui/BrandAssetGridItem';
import { ConfiguratorOption } from '../ui/ConfiguratorOption';

interface VisualStyleStepProps {
  design: BlueprintDesign;
  onUpdate: (updates: Partial<BlueprintDesign>) => void;
  onBack: () => void;
  onNext: () => void;
}

const visualStyles = [
  { value: 'minimal', label: 'Minimal & Clean', description: 'Simple, focused, lots of space', icon: Minimize2 },
  { value: 'dark_cinematic', label: 'Dark & Cinematic', description: 'Dramatic, immersive, bold', icon: Film },
  { value: 'urban', label: 'Urban / Street', description: 'Edgy, authentic, raw', icon: Building2 },
  { value: 'luxury', label: 'Luxury Premium', description: 'Refined, elegant, exclusive', icon: Crown },
  { value: 'playful', label: 'Playful & Creative', description: 'Fun, energetic, dynamic', icon: Sparkles },
  { value: 'tech', label: 'Tech / Modern', description: 'Sleek, innovative, digital', icon: Cpu },
] as const;


const imageryStyles = [
  { value: 'photography', label: 'Photography', description: 'Real photos, human, authentic', icon: Camera },
  { value: 'illustrations', label: 'Illustrations', description: 'Custom artwork, unique style', icon: PenTool },
  { value: 'product', label: 'Product Focus', description: 'Clean product shots, detail oriented', icon: Package },
  { value: 'cinematic', label: 'Cinematic', description: 'Film-like quality, moody lighting', icon: Clapperboard },
  { value: 'minimal', label: 'Minimal / Abstract', description: 'Simple shapes, clean forms', icon: Circle },
] as const;

export const VisualStyleStep = forwardRef<HTMLDivElement, VisualStyleStepProps>(
  function VisualStyleStep({
    design,
    onUpdate,
    onBack,
    onNext,
  }, ref) {
    // Validation - only require visualStyle now
    const isValid = true;

    const brandImageryMode = design.brandImageryMode || 'direction';
    const brandAssets = design.brandAssets || [];

    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [assetViewMode, setAssetViewMode] = useState<'list' | 'grid'>('list');

    // Cleanup blob URLs on unmount to prevent memory leaks
    useEffect(() => {
      return () => {
        brandAssets.forEach(asset => URL.revokeObjectURL(asset.fileUrl));
      };
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    }, []);

    const processFiles = (fileList: FileList | File[]) => {
      setUploadError(null);
      const fileArray = Array.from(fileList);
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const validFiles = fileArray.filter(f => validTypes.includes(f.type));

      if (fileArray.length !== validFiles.length) {
        setUploadError("Invalid format: Please upload JPG, PNG, or WEBP only.");
        if (validFiles.length === 0) return;
      }
      if (brandAssets.length + validFiles.length > 15) {
        setUploadError("Maximum of 15 files allowed.");
        return;
      }

      const newAssets: BrandAsset[] = [];
      for (const file of validFiles) {
        if (file.size > 20 * 1024 * 1024) {
          setUploadError("One or more files exceeded the 20MB limit.");
          continue;
        }
        const fileUrl = URL.createObjectURL(file);
        newAssets.push({
          id: crypto.randomUUID(),
          fileUrl,
          filename: file.name,
          size: file.size,
          type: 'unassigned',
          notes: '',
          isPrimary: false,
          order: brandAssets.length + newAssets.length,
        });
      }
      if (newAssets.length === 0) return;
      onUpdate({ brandAssets: [...brandAssets, ...newAssets] });
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    }, [brandAssets, onUpdate]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
    };

    const handleDeleteAsset = (id: string) => {
      const updated = brandAssets.filter(a => {
        if (a.id === id) URL.revokeObjectURL(a.fileUrl);
        return a.id !== id;
      });
      onUpdate({ brandAssets: updated });
    };

    const handleUpdateAssetType = (id: string, type: BrandAssetType) => {
      onUpdate({ brandAssets: brandAssets.map(a => a.id === id ? { ...a, type } : a) });
    };

    const handleAssetNotesChange = (id: string, notes: string) => {
      onUpdate({ brandAssets: brandAssets.map(a => a.id === id ? { ...a, notes } : a) });
    };

    const handleTogglePrimary = (id: string) => {
      onUpdate({
        brandAssets: brandAssets.map(a => ({ ...a, isPrimary: a.id === id ? !a.isPrimary : false }))
      });
    };

    const handleReorderAssets = useCallback((newOrder: BrandAsset[]) => {
      onUpdate({ brandAssets: newOrder.map((a, i) => ({ ...a, order: i })) });
    }, [onUpdate]);

    return (
      <StepLayout
        ref={ref}
        act="design"
        stepNumber={4}
        title="Visual Style"
        framing="What aesthetic direction fits your brand?"
        onBack={onBack}
        onNext={onNext}
        canGoNext={isValid}
      >
        <div className="space-y-8">
          {/* Overall Aesthetic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <ConfiguratorModuleTitle className="mb-4 flex items-center gap-2">
              Overall Aesthetic <span className="text-destructive">*</span>
              {design.visualStyle && <CheckCircle2 className="w-4 h-4 text-accent" />}
            </ConfiguratorModuleTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {visualStyles.map((style, index) => {
                const Icon = style.icon;
                const isSelected = design.visualStyle === style.value;

                return (
                  <ConfiguratorOption
                    key={style.value}
                    value={style.value}
                    label={style.label}
                    description={style.description}
                    icon={<Icon className="w-5 h-5" />}
                    isSelected={isSelected}
                    onSelect={() => onUpdate({ visualStyle: style.value })}
                    variant="default"
                    indicator="check"
                    index={index}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Imagery Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <ConfiguratorModuleTitle className="mb-4 block">Imagery Style</ConfiguratorModuleTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {imageryStyles.map((style, index) => {
                const Icon = style.icon;
                const isSelected = design.imageryStyle === style.value;

                return (
                  <ConfiguratorOption
                    key={style.value}
                    value={style.value}
                    label={style.label}
                    description={style.description}
                    icon={<Icon className="w-5 h-5" />}
                    isSelected={isSelected}
                    onSelect={() => onUpdate({ imageryStyle: style.value })}
                    variant="default"
                    indicator="check"
                    index={index}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Brand Imagery Mode Switch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-6 border-t border-border/30 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <ConfiguratorModuleTitle className="flex items-center gap-2">Brand Imagery <span className="text-muted-foreground font-normal normal-case tracking-normal">(Optional)</span></ConfiguratorModuleTitle>
                <p className="text-xs text-muted-foreground mt-1">Upload approved brand images to be used in your build.</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold tracking-wider uppercase bg-card/40 border border-border/40 p-1 rounded-md shrink-0 w-fit">
                <button
                  type="button"
                  onClick={() => onUpdate({ brandImageryMode: 'direction' })}
                  className={cn(
                    "px-4 py-2 transition-colors duration-200 rounded-sm",
                    brandImageryMode === 'direction' ? "text-accent bg-accent/10" : "text-foreground/40 hover:text-foreground/70"
                  )}
                >
                  Direction Only
                </button>
                <div className="w-px h-3 bg-border" />
                <button
                  type="button"
                  onClick={() => onUpdate({ brandImageryMode: 'upload' })}
                  className={cn(
                    "px-4 py-2 transition-colors duration-200 rounded-sm",
                    brandImageryMode === 'upload' ? "text-accent bg-accent/10" : "text-foreground/40 hover:text-foreground/70"
                  )}
                >
                  Upload Assets
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {brandImageryMode === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Upload Zone */}
                  <div
                    className={cn(
                      "relative border border-dashed rounded-xl py-10 px-6 flex flex-col items-center justify-center transition-[box-shadow,border-color] duration-[220ms] ease-out cfg-surface bg-card/95 dark:bg-zinc-950/90 cursor-pointer overflow-hidden",
                      isDragging ? "border-accent bg-accent/5" : "border-border/40 dark:border-border/50 hover:border-border"
                    )}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleFileInput}
                    />
                    <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP. Max 15 files, 20MB each.</p>
                        <p className="text-xs text-muted-foreground/60">Headshots, product images, portfolio work, campaign photography.</p>
                      </div>
                      {uploadError && (
                        <div className="mt-2 text-xs font-medium text-red-500/90 flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-full">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {uploadError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Structured Asset List */}
                  <AnimatePresence mode="popLayout">
                    {brandAssets.length > 0 && (
                      <motion.div
                        key="asset-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        {/* Header with view toggle */}
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-foreground">
                            Verified Brand Assets ({brandAssets.length})
                          </Label>
                          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border/30">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAssetViewMode('list')}
                              className={cn(
                                "h-7 w-7 p-0 transition-colors",
                                assetViewMode === 'list'
                                  ? "bg-accent text-accent-foreground"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <List className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAssetViewMode('grid')}
                              className={cn(
                                "h-7 w-7 p-0 transition-colors",
                                assetViewMode === 'grid'
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
                          Drag to reorder • Order affects priority weighting
                        </p>

                        {/* List View */}
                        {assetViewMode === 'list' && (
                          <Reorder.Group
                            axis="y"
                            values={brandAssets}
                            onReorder={handleReorderAssets}
                            className="space-y-3"
                          >
                            {brandAssets.map((asset) => (
                              <BrandAssetListItem
                                key={asset.id}
                                asset={asset}
                                onRemove={handleDeleteAsset}
                                onUpdateType={handleUpdateAssetType}
                                onNotesChange={handleAssetNotesChange}
                                onTogglePrimary={handleTogglePrimary}
                              />
                            ))}
                          </Reorder.Group>
                        )}

                        {/* Grid View */}
                        {assetViewMode === 'grid' && (
                          <Reorder.Group
                            axis="x"
                            values={brandAssets}
                            onReorder={handleReorderAssets}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                          >
                            {brandAssets.map((asset) => (
                              <BrandAssetGridItem
                                key={asset.id}
                                asset={asset}
                                onRemove={handleDeleteAsset}
                                onUpdateType={handleUpdateAssetType}
                                onNotesChange={handleAssetNotesChange}
                                onTogglePrimary={handleTogglePrimary}
                              />
                            ))}
                          </Reorder.Group>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </StepLayout>
    );
  }
);
