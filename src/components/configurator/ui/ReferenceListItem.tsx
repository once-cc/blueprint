import { motion, Reorder, useDragControls } from 'framer-motion';
import { BlueprintReference, ReferenceRole } from '@/types/blueprint';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GripVertical, Maximize2, FileText, ExternalLink, X, Loader2, Check } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export interface ReferenceListItemProps {
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

export function ReferenceListItem({
    refItem,
    roleOptions,
    localNotes,
    savingStatus,
    getDisplayUrl,
    onRemove,
    onUpdateRole,
    onNotesChange,
    onLightboxOpen
}: ReferenceListItemProps) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={refItem}
            dragListener={false}
            dragControls={controls}
            className="mb-3 block"
        >
            <motion.div
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-4 p-4 rounded-xl border border-border/50 bg-card/30 group"
            >
                {/* Drag Handle */}
                <div
                    className="flex items-center shrink-0 cursor-grab active:cursor-grabbing touch-none -ml-2 px-2"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors pointer-events-none" />
                </div>

                {/* Preview */}
                <div
                    className={cn(
                        "w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center relative",
                        refItem.type === 'image' && "cursor-pointer"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (refItem.type === 'image') onLightboxOpen(refItem);
                    }}
                >
                    {refItem.type === 'image' ? (
                        <>
                            <img
                                src={getDisplayUrl(refItem)}
                                alt={refItem.filename || 'Reference'}
                                className="w-full h-full object-cover transition-transform hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center">
                                <Maximize2 className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition-opacity" />
                            </div>
                        </>
                    ) : refItem.type === 'pdf' ? (
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
                                {refItem.filename || refItem.url}
                            </p>
                            {refItem.type === 'link' && (
                                <a
                                    href={refItem.url}
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
                                onRemove(refItem);
                            }}
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div onPointerDownCapture={(e) => e.stopPropagation()}>
                            <Select
                                value={refItem.role || 'other'}
                                onValueChange={(value) => onUpdateRole(refItem, value as ReferenceRole)}
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
                                value={localNotes}
                                onChange={(e) => onNotesChange(refItem, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                placeholder="Add notes..."
                                className="min-h-[32px] h-8 text-xs resize-none w-full pr-16"
                            />
                            {/* Auto-save indicator */}
                            <AnimatePresence mode="wait">
                                {savingStatus === 'saving' && (
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
                                {savingStatus === 'saved' && (
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
    );
}
