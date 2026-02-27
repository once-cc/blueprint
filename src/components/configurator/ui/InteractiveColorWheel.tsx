import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveColorWheelProps {
    baseHue: number;
    relationship: string;
    onChange: (hue: number) => void;
}

export function InteractiveColorWheel({
    baseHue,
    relationship,
    onChange
}: InteractiveColorWheelProps) {
    const wheelRef = useRef<SVGSVGElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const size = 200;
    const center = size / 2;
    const outerRadius = 90;
    const innerRadius = 50;
    const handleRadius = 70;

    const segments = Array.from({ length: 24 }, (_, i) => {
        const startAngle = i * 15 - 90;
        const endAngle = startAngle + 15;
        const hue = i * 15;
        return { startAngle, endAngle, hue };
    });

    const getRelativeHuePositions = useCallback((relType: string, base: number): number[] => {
        switch (relType) {
            case 'monochrome': return [base];
            case 'analogous': return [base - 30, base, base + 30];
            case 'complementary': return [base, base + 180];
            case 'triadic': return [base, base + 120, base + 240];
            default: return [base];
        }
    }, []);

    const huePositions = getRelativeHuePositions(relationship, baseHue);

    const describeArc = useCallback((cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number) => {
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
    }, []);

    const getIndicatorPosition = useCallback((hue: number, radius: number) => {
        const angle = ((hue - 90) * Math.PI) / 180;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
        };
    }, [center]);

    const calculateHue = useCallback((clientX: number, clientY: number) => {
        if (!wheelRef.current) return baseHue;
        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(clientY - centerY, clientX - centerX);
        const hue = ((angle * 180 / Math.PI) + 90 + 360) % 360;
        return Math.round(hue);
    }, [baseHue]);

    const handleDrag = useCallback((clientX: number, clientY: number) => {
        const newHue = calculateHue(clientX, clientY);
        onChange(newHue);
    }, [calculateHue, onChange]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setHasInteracted(true);
        handleDrag(e.clientX, e.clientY);
    }, [handleDrag]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        handleDrag(e.clientX, e.clientY);
    }, [isDragging, handleDrag]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setHasInteracted(true);
        const touch = e.touches[0];
        handleDrag(touch.clientX, touch.clientY);
    }, [handleDrag]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        handleDrag(touch.clientX, touch.clientY);
    }, [isDragging, handleDrag]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    const handlePos = getIndicatorPosition(baseHue, handleRadius);

    return (
        <motion.svg
            ref={wheelRef}
            viewBox={`0 0 ${size} ${size}`}
            className={cn(
                "w-48 h-48 cursor-grab select-none",
                isDragging && "cursor-grabbing"
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
            {segments.map((seg, i) => (
                <path
                    key={i}
                    d={describeArc(center, center, outerRadius, innerRadius, seg.startAngle, seg.endAngle)}
                    fill={`hsl(${seg.hue}, 70%, 50%)`}
                    className="opacity-80 transition-opacity duration-200"
                />
            ))}

            <circle
                cx={center}
                cy={center}
                r={innerRadius - 4}
                fill="hsl(var(--background))"
                className="transition-colors duration-300"
            />

            {(relationship === 'complementary' || relationship === 'triadic') && huePositions.length > 1 && (
                <motion.polygon
                    points={huePositions.map(hue => {
                        const pos = getIndicatorPosition(((hue % 360) + 360) % 360, handleRadius - 10);
                        return `${pos.x},${pos.y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    className="opacity-60"
                    initial={false}
                    animate={{ opacity: 0.6 }}
                />
            )}

            {relationship === 'analogous' && (
                <motion.path
                    d={describeArc(center, center, outerRadius + 2, innerRadius - 2,
                        (baseHue - 30 - 90), (baseHue + 30 - 90))}
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    className="opacity-60"
                    initial={false}
                    animate={{ opacity: 0.6 }}
                />
            )}

            {huePositions.slice(1).map((hue, i) => {
                const normalizedHue = ((hue % 360) + 360) % 360;
                const pos = getIndicatorPosition(normalizedHue, handleRadius);
                return (
                    <motion.circle
                        key={i}
                        cx={pos.x}
                        cy={pos.y}
                        r={6}
                        fill={`hsl(${normalizedHue}, 70%, 50%)`}
                        stroke="white"
                        strokeWidth={2}
                        className="transition-all duration-200"
                        initial={false}
                        animate={{ cx: pos.x, cy: pos.y }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                );
            })}

            <motion.g
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                initial={false}
                animate={{ x: handlePos.x - center, y: handlePos.y - center }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
                <g transform={`translate(${center}, ${center})`}>
                    <circle
                        r={14}
                        fill={`hsl(${baseHue}, 70%, 50%)`}
                        className={cn(
                            "transition-all duration-200",
                            isDragging ? "opacity-40" : "opacity-20"
                        )}
                        style={{ filter: 'blur(4px)' }}
                    />
                    <circle
                        r={10}
                        fill={`hsl(${baseHue}, 70%, 50%)`}
                        stroke="white"
                        strokeWidth={3}
                        className="transition-all duration-200"
                    />
                    <circle
                        r={3}
                        fill="white"
                        className="transition-all duration-200"
                    />
                </g>
            </motion.g>

            <text
                x={center}
                y={center - 8}
                textAnchor="middle"
                className="fill-foreground text-lg font-semibold"
                style={{ fontSize: '18px' }}
            >
                {Math.round(baseHue)}°
            </text>
            <text
                x={center}
                y={center + 12}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: '10px' }}
            >
                Base Hue
            </text>

            <AnimatePresence>
                {!hasInteracted && (
                    <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.g
                            animate={{
                                rotate: [0, 25, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: 2,
                                repeatDelay: 0.5,
                                ease: "easeInOut",
                            }}
                            style={{ originX: `${center}px`, originY: `${center}px` }}
                        >
                            <motion.foreignObject
                                x={handlePos.x + 8}
                                y={handlePos.y - 8}
                                width={28}
                                height={28}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: [0.7, 1, 0.7],
                                    scale: [0.9, 1.1, 0.9],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <div className="flex items-center justify-center w-full h-full">
                                    <Hand className="w-5 h-5 text-accent drop-shadow-lg" />
                                </div>
                            </motion.foreignObject>
                        </motion.g>
                    </motion.g>
                )}
            </AnimatePresence>
        </motion.svg>
    );
}
