import { forwardRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlueprintDesign } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { springConfig } from '../ui/animationConfig';
import { ConfiguratorDropdown, DropdownItem } from '../ui/ConfiguratorDropdown';
import { UploadCloud, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TypographyMotionStepProps {
  design: BlueprintDesign;
  onUpdate: (updates: Partial<BlueprintDesign>) => void;
  onBack: () => void;
  onNext: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type WeightPrefTargets = {
  light: { h1: number; h2: number; h3: number; h4: number; body: number };
  regular: { h1: number; h2: number; h3: number; h4: number; body: number };
  mixed: { h1: number; h2: number; h3: number; h4: number; body: number };
  bold: { h1: number; h2: number; h3: number; h4: number; body: number };
};

const typographyStyles: Array<{
  value: string;
  label: string;
  fontFamily: string;
  headingWeight: number;
  bodyWeight: number;
  maxHeadingWeight: number;
  minBodyWeight: number;
  weightPrefTargets: WeightPrefTargets;
  useCaseHints: { h1: string; h2: string; h3: string };
}> = [
    {
      value: 'modern_minimal',
      label: 'Modern Minimal',
      fontFamily: 'Inter, system-ui, sans-serif',
      headingWeight: 500,
      bodyWeight: 400,
      maxHeadingWeight: 800,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 500, h2: 450, h3: 400, h4: 400, body: 300 },
        regular: { h1: 600, h2: 550, h3: 500, h4: 450, body: 400 },
        mixed: { h1: 700, h2: 600, h3: 500, h4: 450, body: 300 },
        bold: { h1: 800, h2: 700, h3: 600, h4: 550, body: 500 },
      },
      useCaseHints: { h1: 'Clean product launches', h2: 'Streamlined portfolios', h3: 'Tech-forward brands' }
    },
    {
      value: 'elegant_premium',
      label: 'Elegant Premium',
      fontFamily: 'Playfair Display, Georgia, serif',
      headingWeight: 500,
      bodyWeight: 400,
      maxHeadingWeight: 900,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 500, h2: 450, h3: 400, h4: 400, body: 300 },
        regular: { h1: 600, h2: 550, h3: 500, h4: 450, body: 400 },
        mixed: { h1: 700, h2: 600, h3: 550, h4: 500, body: 300 },
        bold: { h1: 800, h2: 700, h3: 650, h4: 600, body: 500 },
      },
      useCaseHints: { h1: 'Luxury brand storytelling', h2: 'High-end hospitality', h3: 'Refined lifestyle brands' }
    },
    {
      value: 'bold_expressive',
      label: 'Bold Expressive',
      fontFamily: 'Syne, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      maxHeadingWeight: 850,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 600, h2: 550, h3: 500, h4: 450, body: 300 },
        regular: { h1: 700, h2: 650, h3: 600, h4: 550, body: 400 },
        mixed: { h1: 780, h2: 720, h3: 650, h4: 600, body: 300 },
        bold: { h1: 850, h2: 800, h3: 750, h4: 700, body: 500 },
      },
      useCaseHints: { h1: 'Creative agency manifestos', h2: 'Event campaigns', h3: 'Youth-focused brands' }
    },
    {
      value: 'tech_sans',
      label: 'Tech / Sans-Serif',
      fontFamily: 'Space Grotesk, system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      maxHeadingWeight: 700,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 500, h2: 450, h3: 400, h4: 400, body: 300 },
        regular: { h1: 600, h2: 550, h3: 500, h4: 450, body: 400 },
        mixed: { h1: 700, h2: 600, h3: 500, h4: 450, body: 300 },
        bold: { h1: 700, h2: 700, h3: 600, h4: 500, body: 500 },
      },
      useCaseHints: { h1: 'SaaS product interfaces', h2: 'Developer documentation', h3: 'Fintech dashboards' }
    },
    {
      value: 'editorial',
      label: 'Editorial',
      fontFamily: 'Cormorant Garamond, serif',
      headingWeight: 400,
      bodyWeight: 300,
      maxHeadingWeight: 700,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 400, h2: 350, h3: 300, h4: 300, body: 300 },
        regular: { h1: 500, h2: 450, h3: 400, h4: 350, body: 300 },
        mixed: { h1: 600, h2: 500, h3: 400, h4: 350, body: 300 },
        bold: { h1: 700, h2: 600, h3: 500, h4: 450, body: 400 },
      },
      useCaseHints: { h1: 'Long-form journalism', h2: 'Cultural publications', h3: 'Author portfolios' }
    },
    {
      value: 'display',
      label: 'Display / Statement',
      fontFamily: 'Oswald, Impact, sans-serif',
      headingWeight: 500,
      bodyWeight: 400,
      maxHeadingWeight: 700,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 400, h2: 400, h3: 400, h4: 400, body: 300 },
        regular: { h1: 500, h2: 500, h3: 500, h4: 500, body: 400 },
        mixed: { h1: 700, h2: 600, h3: 500, h4: 500, body: 300 },
        bold: { h1: 700, h2: 700, h3: 600, h4: 600, body: 500 },
      },
      useCaseHints: { h1: 'Hero announcements', h2: 'Sports & entertainment', h3: 'Bold campaign headlines' }
    },
  ];

const fontWeights = [
  { value: 'light', label: 'Light / Thin' },
  { value: 'regular', label: 'Regular' },
  { value: 'mixed', label: 'Mixed Weights' },
  { value: 'bold', label: 'Bold / Heavy' },
] as const;

export const TypographyMotionStep = forwardRef<HTMLDivElement, TypographyMotionStepProps>(
  function TypographyMotionStep({
    design,
    onUpdate,
    onBack,
    onNext,
  }, ref) {
    const currentTypography = design.typography_direction || design.typographyStyle;
    const mode = design.typographyMode || 'direction';
    const customFonts = design.customFonts || { files: [], roles: {} };
    const files = customFonts.files || [];
    const roles = customFonts.roles || {};

    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Provide font-face injection via side effect
    useEffect(() => {
      if (files.length === 0) return;

      let styleContent = '';
      files.forEach((font) => {
        const format = font.filename.toLowerCase().endsWith('.woff2') ? 'woff2' : 'woff';
        styleContent += `
        @font-face {
          font-family: 'BlueprintCustom-${font.id}';
          src: url(${font.fileData}) format('${format}');
          font-weight: ${font.weight};
          font-style: ${font.style};
        }\n`;
      });

      if (!styleContent) return;

      const styleId = 'blueprint-custom-fonts';
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = styleContent;

      return () => {
        // Keeps persisting across re-renders for smooth transitions
      };
    }, [files]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    }, []);

    const processFiles = async (fileList: FileList | File[]) => {
      setUploadError(null);

      const fileArray = Array.from(fileList);
      const validFiles = fileArray.filter(f => f.name.toLowerCase().endsWith('.woff2') || f.name.toLowerCase().endsWith('.woff'));

      if (fileArray.length !== validFiles.length) {
        setUploadError("Invalid format: Please upload WOFF or WOFF2 files only.");
        if (validFiles.length === 0) return;
      }

      if (files.length + validFiles.length > 6) {
        setUploadError("Maximum of 6 files allowed.");
        return;
      }

      const newFonts: any[] = [];
      for (const file of validFiles) {
        if (file.size > 3 * 1024 * 1024) {
          setUploadError("One or more files exceeded the 3MB limit.");
          continue;
        }

        const reader = new FileReader();
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          newFonts.push({
            id: crypto.randomUUID(),
            fileData: dataUrl,
            filename: file.name,
            weight: '400',
            style: 'normal'
          });
        } catch (e) {
          console.error("Failed to read file", e);
        }
      }

      if (newFonts.length === 0) return;

      onUpdate({
        customFonts: {
          files: [...files, ...newFonts],
          roles: { ...roles }
        }
      });
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    }, [files, roles, onUpdate]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    };

    const handleUpdateFile = (id: string, updates: any) => {
      const updatedFiles = files.map(f => f.id === id ? { ...f, ...updates } : f);
      onUpdate({ customFonts: { files: updatedFiles, roles: { ...roles } } });
    };

    const handleDeleteFile = (id: string) => {
      const updatedFiles = files.filter(f => f.id !== id);
      // Remove this ID from any roles it was assigned to
      const updatedRoles = { ...roles } as Record<string, string | undefined>;
      Object.keys(updatedRoles).forEach(key => {
        if (updatedRoles[key] === id) {
          updatedRoles[key] = undefined;
        }
      });
      onUpdate({ customFonts: { files: updatedFiles, roles: updatedRoles as any } });
    };

    const handleUpdateRole = (roleKey: string, fileId?: string) => {
      onUpdate({ customFonts: { files: [...files], roles: { ...roles, [roleKey]: fileId } } });
    };

    // Check completion rules: H1 and Body must be assigned
    let isValid = false;
    if (mode === 'direction') {
      isValid = !!currentTypography;
    } else {
      isValid = !!(roles.h1 && roles.body);
    }

    const typographyItems: DropdownItem[] = typographyStyles.map(style => ({
      value: style.value,
      label: style.label,
      fontFamily: style.fontFamily,
      fontWeight: style.headingWeight,
      renderPreview: (
        <div className="space-y-1" style={{ fontFamily: style.fontFamily }}>
          <p
            className="text-base text-foreground leading-tight"
            style={{ fontWeight: style.headingWeight }}
          >
            {style.useCaseHints.h1}
          </p>
          <p
            className="text-sm text-foreground/80 leading-tight"
            style={{ fontWeight: Math.max(300, style.headingWeight - 100) }}
          >
            {style.useCaseHints.h2}
          </p>
          <p
            className="text-xs text-muted-foreground leading-tight"
            style={{ fontWeight: style.bodyWeight }}
          >
            {style.useCaseHints.h3}
          </p>
        </div>
      ),
    }));

    return (
      <StepLayout
        ref={ref}
        act="design"
        stepNumber={5}
        title="Typography Direction"
        framing="Set the typographic posture for your brand."
        onBack={onBack}
        onNext={onNext}
        canGoNext={isValid}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => onUpdate({ typographyMode: 'direction' })}
              className={cn(
                "font-raela text-[10px] uppercase tracking-wide transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] select-none",
                mode === 'direction' ? "text-accent" : "text-[#ebe9e0]/35 hover:text-[#ebe9e0]/50"
              )}
            >
              Direction
            </button>
            <span className="text-[#ebe9e0]/20 text-[10px] select-none mx-0.5">|</span>
            <button
              type="button"
              onClick={() => onUpdate({ typographyMode: 'upload' })}
              className={cn(
                "font-raela text-[10px] uppercase tracking-wide transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] select-none",
                mode === 'upload' ? "text-accent" : "text-[#ebe9e0]/35 hover:text-[#ebe9e0]/50"
              )}
            >
              Upload
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {mode === 'direction' ? (
              <motion.div
                key="mode-direction"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Typography Style Dropdown */}
                <div className="space-y-2">
                  <ConfiguratorDropdown
                    label="Typography Direction"
                    required
                    value={currentTypography ?? null}
                    onChange={(value) => onUpdate({
                      typography_direction: value as BlueprintDesign['typography_direction'],
                      typographyStyle: value as BlueprintDesign['typographyStyle']
                    })}
                    items={typographyItems}
                    maxHeight={320}
                    hideUnselectedHelperText
                  />
                </div>

                {/* Live Typography Preview */}
                <AnimatePresence mode="wait">
                  {currentTypography && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="p-5 rounded-xl border border-border/50 bg-card/50 overflow-hidden"
                    >
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Preview</p>
                      <AnimatePresence mode="popLayout">
                        {(() => {
                          const style = typographyStyles.find(s => s.value === currentTypography);
                          if (!style) return null;

                          const fontWeightPref = (design.fontWeight || 'regular') as 'light' | 'regular' | 'mixed' | 'bold';
                          const targets = style.weightPrefTargets[fontWeightPref] || style.weightPrefTargets.regular;

                          const maxWeight = style.maxHeadingWeight;
                          const minBody = style.minBodyWeight;

                          const effectiveH1Weight = clamp(targets.h1, 100, maxWeight);
                          const effectiveH2Weight = clamp(targets.h2, 100, maxWeight);
                          const effectiveH3Weight = clamp(targets.h3, 100, maxWeight);
                          const effectiveH4Weight = clamp(targets.h4, 100, maxWeight);
                          const effectiveBodyWeight = clamp(targets.body, minBody, 700);

                          return (
                            <motion.div
                              key={currentTypography}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="space-y-3"
                              style={{ fontFamily: style.fontFamily }}
                            >
                              <motion.h1 className="text-3xl md:text-4xl text-foreground" style={{ fontFamily: style.fontFamily }} animate={{ fontWeight: effectiveH1Weight }} transition={{ duration: 0.3, ease: 'easeOut' }}>{style.useCaseHints.h1}</motion.h1>
                              <motion.h2 className="text-xl md:text-2xl text-foreground/90" style={{ fontFamily: style.fontFamily }} animate={{ fontWeight: effectiveH2Weight }} transition={{ duration: 0.3, ease: 'easeOut' }}>{style.useCaseHints.h2}</motion.h2>
                              <motion.h3 className="text-base md:text-lg text-foreground/80" style={{ fontFamily: style.fontFamily }} animate={{ fontWeight: effectiveH3Weight }} transition={{ duration: 0.3, ease: 'easeOut' }}>{style.useCaseHints.h3}</motion.h3>
                              <motion.h4 className="text-sm md:text-base font-medium text-foreground/70" style={{ fontFamily: style.fontFamily }} animate={{ fontWeight: effectiveH4Weight }} transition={{ duration: 0.3, ease: 'easeOut' }}>H4 Subheading Example</motion.h4>
                              <motion.p className="text-sm md:text-base text-muted-foreground leading-relaxed pt-2 border-t border-border/30" style={{ fontFamily: style.fontFamily }} animate={{ fontWeight: effectiveBodyWeight }} transition={{ duration: 0.3, ease: 'easeOut' }}>Body text for detailed descriptions and supporting content.</motion.p>
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Font Weight Preference */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Font Weight Preference</Label>
                  <RadioGroup
                    value={design.fontWeight}
                    onValueChange={(value) => onUpdate({ fontWeight: value as BlueprintDesign['fontWeight'] })}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    {fontWeights.map((weight, index) => {
                      const isSelected = design.fontWeight === weight.value;
                      return (
                        <motion.div
                          key={weight.value}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ ...springConfig, delay: 0.03 * index }}
                          whileHover={{ scale: 1.02, transition: springConfig }}
                          whileTap={{ scale: 0.98, transition: springConfig }}
                        >
                          <Label
                            htmlFor={weight.value}
                            className={cn(
                              'flex items-center justify-center gap-2 p-4 rounded-xl transition-all duration-[220ms] ease-out cfg-surface border bg-card/80 backdrop-blur-sm cursor-pointer text-center group',
                              isSelected
                                ? 'border-accent/50 cfg-surface-selected text-foreground'
                                : 'border-border/40 dark:border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-card/90'
                            )}
                          >
                            <RadioGroupItem value={weight.value} id={weight.value} className="sr-only" />
                            <motion.span animate={{ x: isSelected ? 2 : 0 }} transition={springConfig} className="text-sm font-medium">{weight.label}</motion.span>
                          </Label>
                        </motion.div>
                      );
                    })}
                  </RadioGroup>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="mode-upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Upload Zone */}
                <div
                  className={cn(
                    "relative border border-dashed rounded-xl py-10 px-6 flex flex-col items-center justify-center transition-all duration-[220ms] ease-out cfg-surface bg-card/80 backdrop-blur-sm cursor-pointer overflow-hidden",
                    isDragging ? "border-accent bg-accent/5" : "border-border/40 dark:border-border/50 hover:border-border hover:bg-card/90"
                  )}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept=".woff,.woff2"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileInput}
                  />
                  <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">WOFF or WOFF2 only. Maximum 6 files, up to 3MB each.</p>
                    </div>
                    {uploadError && (
                      <div className="mt-2 text-xs font-medium text-red-500/90 flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {uploadError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Uploaded Files */}
                {files.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground">Uploaded Files</Label>
                    <div className="grid gap-3">
                      {files.map(file => (
                        <div key={file.id} className="flex flex-row gap-3 items-center justify-between p-3 rounded-xl transition-all duration-[220ms] ease-out cfg-surface border bg-card/80 backdrop-blur-sm border-border/40 dark:border-border/50 hover:border-border hover:bg-card/90 overflow-x-auto min-w-0">
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col shrink-0">
                              <p className="text-sm text-foreground max-w-[120px] sm:max-w-[200px] truncate" title={file.filename}>
                                {file.filename}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Select value={file.weight} onValueChange={(v) => handleUpdateFile(file.id, { weight: v })}>
                              <SelectTrigger className="w-[80px] sm:w-[100px] h-8 text-xs shrink-0"><SelectValue placeholder="Weight" /></SelectTrigger>
                              <SelectContent>
                                {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(w => (
                                  <SelectItem key={w} value={w.toString()}>{w}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={file.style} onValueChange={(v) => handleUpdateFile(file.id, { style: v })}>
                              <SelectTrigger className="w-[75px] sm:w-[90px] h-8 text-xs shrink-0"><SelectValue placeholder="Style" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="italic">Italic</SelectItem>
                              </SelectContent>
                            </Select>
                            <button type="button" onClick={() => handleDeleteFile(file.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors rounded-md hover:bg-card shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Type Roles Assignment */}
                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.div
                      key="type-roles-section"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3">
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: 0.05 }}
                        >
                          <Label className="text-sm font-medium text-foreground">Type Roles</Label>
                        </motion.div>
                        <div className="grid gap-2">
                          {['h1', 'h2', 'h3', 'eyebrow', 'body', 'button'].map((roleKey, index) => {
                            const labels: Record<string, string> = {
                              h1: 'H1 (Heading 1)', h2: 'H2 (Heading 2)', h3: 'H3 (Heading 3)', eyebrow: 'Eyebrow', body: 'Body', button: 'Button'
                            };
                            const value = roles[roleKey as keyof typeof roles] || '';
                            const isRequired = roleKey === 'h1' || roleKey === 'body';

                            return (
                              <motion.div
                                key={roleKey}
                                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                transition={{
                                  duration: 0.28,
                                  delay: index * 0.06,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                              >
                                <div className="flex flex-row gap-3 items-center justify-between p-3 rounded-xl transition-all duration-[220ms] ease-out cfg-surface border bg-card/80 backdrop-blur-sm border-border/40 dark:border-border/50 hover:border-border hover:bg-card/90 overflow-x-auto min-w-0">
                                  <div className="flex flex-col shrink-0">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                                      {labels[roleKey]}
                                      {isRequired && <span className="w-1.5 h-1.5 rounded-full bg-accent/70" title="Required"></span>}
                                    </p>
                                  </div>
                                  <Select value={value} onValueChange={v => handleUpdateRole(roleKey, v === 'unassigned' ? undefined : v)}>
                                    <SelectTrigger className="w-[140px] sm:w-[220px] h-8 text-xs shrink-0"><SelectValue placeholder="Assign a font..." /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unassigned">None</SelectItem>
                                      {files.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.filename} ({f.weight} {f.style})</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upload Mode Preview Block */}
                {roles.h1 && roles.body && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl border border-border/50 bg-card/50 overflow-hidden"
                  >
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Preview</p>
                    <div className="space-y-4">
                      {/* Eyebrow */}
                      {roles.eyebrow && (() => {
                        const f = files.find(f => f.id === roles.eyebrow);
                        if (!f) return null;
                        return (
                          <p className="text-xs uppercase tracking-widest text-accent" style={{ fontFamily: `'BlueprintCustom-${f.id}'`, fontWeight: f.weight, fontStyle: f.style }}>Supercharge Workflow</p>
                        );
                      })()}

                      {/* H1 */}
                      {roles.h1 && (() => {
                        const f = files.find(f => f.id === roles.h1);
                        if (!f) return null;
                        return (
                          <h1 className="text-3xl md:text-4xl text-foreground" style={{ fontFamily: `'BlueprintCustom-${f.id}'`, fontWeight: f.weight, fontStyle: f.style }}>The next generation of configurator tools.</h1>
                        );
                      })()}

                      {/* H2 */}
                      {roles.h2 && (() => {
                        const f = files.find(f => f.id === roles.h2);
                        if (!f) return null;
                        return (
                          <h2 className="text-xl md:text-2xl text-foreground/90" style={{ fontFamily: `'BlueprintCustom-${f.id}'`, fontWeight: f.weight, fontStyle: f.style }}>Build unparalleled digital experiences dynamically.</h2>
                        );
                      })()}

                      {/* H3 */}
                      {roles.h3 && (() => {
                        const f = files.find(f => f.id === roles.h3);
                        if (!f) return null;
                        return (
                          <h3 className="text-base md:text-lg text-foreground/80 mt-2" style={{ fontFamily: `'BlueprintCustom-${f.id}'`, fontWeight: f.weight, fontStyle: f.style }}>Seamless integration capabilities out of the box.</h3>
                        );
                      })()}

                      {/* Body */}
                      {roles.body && (() => {
                        const f = files.find(f => f.id === roles.body);
                        if (!f) return null;
                        return (
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed pt-2 border-t border-border/30" style={{ fontFamily: `'BlueprintCustom-${f.id}'`, fontWeight: f.weight, fontStyle: f.style }}>
                            Our platform utilizes cutting-edge architecture to ensure that your bespoke typography doesn't just look incredible, but performs exceptionally across all viewports.
                          </p>
                        );
                      })()}

                      {/* Button */}
                      {roles.button && (() => {
                        const f = files.find(f => f.id === roles.button);
                        if (!f) return null;
                        return (
                          <div className="pt-2">
                            <button type="button" className="px-5 py-2.5 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors" style={{ fontFamily: `'BlueprintCustom-${f.id}'`, fontWeight: f.weight, fontStyle: f.style }}>
                              Start Building
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </StepLayout>
    );
  }
);
