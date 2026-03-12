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

export interface BrandAssetGridItemProps {
    asset: BrandAsset;
    onRemove: (id: string) => void;
    onUpdateType: (id: string, type: BrandAssetType) => void;
    onNotesChange: (id: string, notes: string) => void;
    onTogglePrimary: (id: string) => void;
}

export function BrandAssetGridItem({
    asset,
    onRemove,
    onUpdateType,
    onNotesChange,
    onTogglePrimary,
}: BrandAssetGridItemProps) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={asset}
            dragListener={false}
            dragControls={controls}
            className="block"
        >
            <motion.div
                layout="position"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-xl transition-all duration-[220ms] ease-out cfg-surface bg-card/95 dark:bg-zinc-950/90 border border-border/40 dark:border-border/50 hover:border-border overflow-hidden group"
            >
                {/* Thumbnail */}
                <img
                    src={asset.fileUrl}
                    alt={asset.filename}
                    className="w-full h-full object-cover"
                />

                {/* Primary Badge (always visible when set) */}
                {asset.isPrimary && (
                    <div className="absolute top-2 left-9 w-6 h-6 rounded-full bg-accent flex items-center justify-center z-10 shadow-md">
                        <Star className="w-3 h-3 text-accent-foreground fill-current" />
                    </div>
                )}

                {/* Overlay Gradients */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Drag Handle (Top Left) */}
                <div
                    className="absolute top-2 left-2 flex items-center justify-center w-7 h-7 rounded-md bg-black/60 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none z-10"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical className="w-4 h-4 pointer-events-none" />
                </div>

                {/* Top Controls */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {/* Primary Toggle */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onTogglePrimary(asset.id); }}
                        className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-md transition-colors",
                            asset.isPrimary
                                ? "bg-accent/80 text-accent-foreground"
                                : "bg-black/40 hover:bg-black/60 text-white"
                        )}
                        title={asset.isPrimary ? "Primary asset" : "Mark as primary"}
                    >
                        <Star className={cn("w-3 h-3", asset.isPrimary && "fill-current")} />
                    </button>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="w-7 h-7 bg-red-500/80 hover:bg-red-500 text-white border-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(asset.id);
                        }}
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </div>

                {/* Bottom Form (Type + Notes) */}
                <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-2 translate-y-[2px] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div onPointerDownCapture={(e) => e.stopPropagation()}>
                        <Select
                            value={asset.type}
                            onValueChange={(value) => onUpdateType(asset.id, value as BrandAssetType)}
                        >
                            <SelectTrigger
                                className={cn(
                                    "w-full h-8 text-xs bg-black/60 border-white/20 text-white hover:bg-black/70",
                                    asset.type === 'unassigned' && "text-white/50"
                                )}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <span className="truncate">
                                    {ASSET_TYPE_OPTIONS.find(o => o.id === asset.type)?.label || 'Asset Type'}
                                </span>
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
                        className="relative"
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
                            className="min-h-[50px] h-[50px] text-xs resize-none w-full bg-black/60 border-white/20 text-white placeholder-white/50 focus-visible:ring-white/30"
                        />
                    </div>
                </div>

                {/* Filename Badge (visible when not hovered) */}
                <div className="absolute inset-x-2 bottom-2 opacity-100 group-hover:opacity-0 transition-opacity duration-300 flex justify-center pointer-events-none">
                    <div className="bg-black/70 rounded-full px-3 py-1 text-[10px] text-white/90 truncate max-w-full drop-shadow-md">
                        {asset.filename}
                    </div>
                </div>
            </motion.div>
        </Reorder.Item>
    );
}
