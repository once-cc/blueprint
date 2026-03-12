import { motion, Reorder, useDragControls, AnimatePresence } from 'framer-motion';
import { BrandAsset, BrandAssetType } from '@/types/blueprint';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GripVertical, X, Star } from 'lucide-react';

const ASSET_TYPE_OPTIONS: { id: BrandAssetType; label: string }[] = [
    { id: 'unassigned', label: 'Unassigned' },
    { id: 'headshot', label: 'Headshot' },
    { id: 'product', label: 'Product' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'campaign', label: 'Campaign' },
    { id: 'logo', label: 'Logo' },
    { id: 'background', label: 'Background' },
    { id: 'texture', label: 'Texture' },
    { id: 'other', label: 'Other' },
];

export interface BrandAssetListItemProps {
    asset: BrandAsset;
    onRemove: (id: string) => void;
    onUpdateType: (id: string, type: BrandAssetType) => void;
    onNotesChange: (id: string, notes: string) => void;
    onTogglePrimary: (id: string) => void;
}

export function BrandAssetListItem({
    asset,
    onRemove,
    onUpdateType,
    onNotesChange,
    onTogglePrimary,
}: BrandAssetListItemProps) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={asset}
            dragListener={false}
            dragControls={controls}
            className="mb-3 block"
        >
            <motion.div
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 p-4 rounded-xl border border-border/40 dark:border-border/50 transition-all duration-[220ms] ease-out cfg-surface bg-card/95 dark:bg-zinc-950/90 group hover:border-border"
            >
                {/* Drag Handle */}
                <div
                    className="flex items-center shrink-0 cursor-grab active:cursor-grabbing touch-none -ml-2 px-2"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors pointer-events-none" />
                </div>

                {/* Thumbnail */}
                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center relative">
                    <img
                        src={asset.fileUrl}
                        alt={asset.filename}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    {/* Primary Badge */}
                    {asset.isPrimary && (
                        <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                            <Star className="w-3 h-3 text-accent-foreground fill-current" />
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {asset.filename}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                {(asset.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {/* Primary Toggle */}
                            <button
                                type="button"
                                onClick={() => onTogglePrimary(asset.id)}
                                className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    asset.isPrimary
                                        ? "text-accent bg-accent/10"
                                        : "text-muted-foreground/40 hover:text-accent/70 hover:bg-accent/5"
                                )}
                                title={asset.isPrimary ? "Primary asset" : "Mark as primary"}
                            >
                                <Star className={cn("w-3.5 h-3.5", asset.isPrimary && "fill-current")} />
                            </button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(asset.id);
                                }}
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div onPointerDownCapture={(e) => e.stopPropagation()}>
                            <Select
                                value={asset.type}
                                onValueChange={(value) => onUpdateType(asset.id, value as BrandAssetType)}
                            >
                                <SelectTrigger
                                    className={cn(
                                        "w-full sm:w-44 h-8 text-xs",
                                        asset.type === 'unassigned' && "text-muted-foreground"
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                    <SelectValue placeholder="Asset Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ASSET_TYPE_OPTIONS.map((option) => (
                                        <SelectItem key={option.id} value={option.id}>
                                            <span className={cn(option.id === 'unassigned' && "text-muted-foreground")}>
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
                                value={asset.notes}
                                onChange={(e) => onNotesChange(asset.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                placeholder="Add usage notes (optional)"
                                className="min-h-[32px] h-8 text-xs resize-none w-full"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Reorder.Item>
    );
}
