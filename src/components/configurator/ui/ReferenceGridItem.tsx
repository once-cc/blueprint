import { motion, Reorder, useDragControls } from 'framer-motion';
import { BlueprintReference, ReferenceRole } from '@/types/blueprint';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Maximize2, FileText, ExternalLink, X, Loader2, Check, GripVertical } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export interface ReferenceGridItemProps {
    refItem: BlueprintReference;
    roleOptions: { id: ReferenceRole; label: string; icon: React.ElementType }[];
    localNotes: string;
    savingStatus: 'idle' | 'saving' | 'saved' | undefined;
    getDisplayUrl: (ref: BlueprintReference) => string;
    onRemove: (ref: BlueprintReference) => void;
    onUpdateRole: (ref: BlueprintReference, role: ReferenceRole) => void;
    onNotesChange: (ref: BlueprintReference, notes: string) => void;
    onLightboxOpen: (ref: BlueprintReference) => void;
}

export function ReferenceGridItem({
    refItem,
    roleOptions,
    localNotes,
    savingStatus,
    getDisplayUrl,
    onRemove,
    onUpdateRole,
    onNotesChange,
    onLightboxOpen
}: ReferenceGridItemProps) {
    const RoleIcon = roleOptions.find(r => r.id === refItem.role)?.icon || FileText;
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={refItem}
            dragListener={false}
            dragControls={controls}
            className="block"
        >
            <motion.div
                layout="position"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-xl transition-all duration-[220ms] ease-out cfg-surface bg-card/80 backdrop-blur-sm border border-border/40 dark:border-border/50 hover:border-border hover:bg-card/90 overflow-hidden group"
            >
                {/* Thumbnail */}
                {refItem.type === 'image' ? (
                    <img
                        src={getDisplayUrl(refItem)}
                        alt={refItem.filename || 'Reference'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/20">
                        {refItem.type === 'pdf' ? (
                            <FileText className="w-10 h-10 text-muted-foreground" />
                        ) : (
                            <ExternalLink className="w-10 h-10 text-muted-foreground" />
                        )}
                    </div>
                )}

                {/* Overlay Gradients */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Drag Handle (Top Left) */}
                <div
                    className="absolute top-2 left-2 flex items-center justify-center w-7 h-7 rounded-md bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none z-10"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical className="w-4 h-4 pointer-events-none" />
                </div>

                {/* Top Controls */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {refItem.type === 'image' && (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="w-7 h-7 bg-black/40 hover:bg-black/60 text-white border-0 backdrop-blur-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onLightboxOpen(refItem);
                            }}
                        >
                            <Maximize2 className="w-3 h-3" />
                        </Button>
                    )}
                    {refItem.type === 'link' && (
                        <a
                            href={refItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center w-7 h-7 rounded-md bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                    <Button
                        variant="destructive"
                        size="icon"
                        className="w-7 h-7 bg-red-500/80 hover:bg-red-500 text-white border-0 backdrop-blur-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(refItem);
                        }}
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </div>

                {/* Bottom Form (Role + Notes) */}
                <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-2 translate-y-[2px] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div onPointerDownCapture={(e) => e.stopPropagation()}>
                        <Select
                            value={refItem.role || 'other'}
                            onValueChange={(value) => onUpdateRole(refItem, value as ReferenceRole)}
                        >
                            <SelectTrigger
                                className="w-full h-8 text-xs bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-md"
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <RoleIcon className="w-3 h-3 shrink-0" />
                                    <span className="truncate">
                                        {roleOptions.find(r => r.id === refItem.role)?.label || 'Select role'}
                                    </span>
                                </div>
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
                        className="relative"
                        onPointerDownCapture={(e) => e.stopPropagation()}
                    >
                        <Textarea
                            value={localNotes}
                            onChange={(e) => onNotesChange(refItem, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            placeholder="Add notes..."
                            className="min-h-[50px] h-[50px] text-xs resize-none w-full bg-black/40 border-white/20 text-white placeholder-white/50 focus-visible:ring-white/30 backdrop-blur-md"
                        />
                        {/* Auto-save indicator */}
                        <AnimatePresence mode="wait">
                            {savingStatus === 'saving' && (
                                <motion.div
                                    key="saving"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute right-2 bottom-2 text-white/50"
                                >
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                </motion.div>
                            )}
                            {savingStatus === 'saved' && (
                                <motion.div
                                    key="saved"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute right-2 bottom-2 text-green-400"
                                >
                                    <Check className="w-3 h-3" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Filename Badge (visible when not hovered) */}
                <div className="absolute inset-x-2 bottom-2 opacity-100 group-hover:opacity-0 transition-opacity duration-300 flex justify-center pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-[10px] text-white/90 truncate max-w-full drop-shadow-md">
                        {refItem.filename || refItem.url}
                    </div>
                </div>
            </motion.div>
        </Reorder.Item>
    );
}
