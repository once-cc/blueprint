import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function CopyHexButton({ hex }: { hex: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(hex);
            setCopied(true);
            toast({
                title: "Copied!",
                description: `${hex} copied to clipboard`,
            });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({
                title: "Failed to copy",
                description: "Please copy manually",
                variant: "destructive",
            });
        }
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-9 w-9 shrink-0"
        >
            <AnimatePresence mode="wait">
                {copied ? (
                    <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                    >
                        <Copy className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                )}
            </AnimatePresence>
        </Button>
    );
}

export function ColorWheelDiagram({ type, isSelected }: { type: string; isSelected: boolean }) {
    const size = 32;
    const center = size / 2;
    const outerRadius = 14;
    const innerRadius = 6;
    const indicatorRadius = (outerRadius + innerRadius) / 2;

    const segments = Array.from({ length: 12 }, (_, i) => {
        const startAngle = i * 30 - 90;
        const endAngle = startAngle + 30;
        const hue = i * 30;
        return { startAngle, endAngle, hue };
    });

    const getHuePositions = (relType: string): number[] => {
        switch (relType) {
            case 'monochrome': return [0];
            case 'analogous': return [330, 0, 30];
            case 'complementary': return [0, 180];
            case 'triadic': return [0, 120, 240];
            default: return [0];
        }
    };

    const huePositions = getHuePositions(type);

    const describeArc = (cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number) => {
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = cx + outerR * Math.cos(startRad);
        const y1 = cy + outerR * Math.sin(startRad);
        const x2 = cx + outerR * Math.cos(endRad);
        const y2 = cy + outerR * Math.sin(endRad);
        const x3 = cx + innerR * Math.cos(endRad);
        const y3 = cy + innerR * Math.sin(endRad);
        const x4 = cx + innerR * Math.cos(startRad);
        const y4 = cy + innerR * Math.sin(startRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    };

    const getIndicatorPosition = (hue: number) => {
        const angle = ((hue - 90) * Math.PI) / 180;
        return {
            x: center + indicatorRadius * Math.cos(angle),
            y: center + indicatorRadius * Math.sin(angle),
        };
    };

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-8 h-8">
            {segments.map((seg, i) => (
                <path
                    key={i}
                    d={describeArc(center, center, outerRadius, innerRadius, seg.startAngle, seg.endAngle)}
                    fill={`hsl(${seg.hue}, 70%, 50%)`}
                    opacity={isSelected ? 0.85 : 0.5}
                    className="transition-opacity duration-200"
                />
            ))}

            {(type === 'complementary' || type === 'triadic') && huePositions.length > 1 && (
                <motion.polygon
                    key={`polygon-${type}`}
                    fill="none"
                    stroke={isSelected ? 'white' : 'rgba(255,255,255,0.5)'}
                    strokeWidth={1.5}
                    initial={false}
                    animate={{
                        points: huePositions.map(hue => {
                            const pos = getIndicatorPosition(hue);
                            return `${pos.x},${pos.y}`;
                        }).join(' ')
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
            )}

            {type === 'analogous' && (
                <motion.path
                    d={describeArc(center, center, outerRadius + 1, innerRadius - 1, -30, 30)}
                    fill="none"
                    stroke={isSelected ? 'white' : 'rgba(255,255,255,0.4)'}
                    strokeWidth={1.5}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                />
            )}

            {huePositions.map((hue, i) => {
                const pos = getIndicatorPosition(hue);
                return (
                    <motion.circle
                        key={`${type}-${i}`}
                        r={2.5}
                        fill="white"
                        stroke={isSelected ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.6)'}
                        strokeWidth={1.5}
                        initial={false}
                        animate={{ cx: pos.x, cy: pos.y }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                );
            })}
        </svg>
    );
}

export const RelationshipIcon = ColorWheelDiagram;
