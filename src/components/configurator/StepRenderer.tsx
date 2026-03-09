import { Suspense, lazy } from 'react';
import { ConfiguratorAct, Blueprint, BlueprintDesign, BlueprintReference, BlueprintDiscovery, BlueprintDeliver } from '@/types/blueprint';

// Act I
import { BusinessFoundationsStep } from './steps/BusinessFoundationsStep';
import { BrandVoiceStep } from './steps/BrandVoiceStep';
import { CTAEnergyStep } from './steps/CTAEnergyStep';

// Act II - Lazy Loaded
const VisualStyleStep = lazy(() => import('./steps/VisualStyleStep').then(m => ({ default: m.VisualStyleStep })));
const CreativeRiskStep = lazy(() => import('./steps/CreativeRiskStep').then(m => ({ default: m.CreativeRiskStep })));
const ColorPaletteStep = lazy(() => import('./steps/ColorPaletteStep').then(m => ({ default: m.ColorPaletteStep })));
const TypographyMotionStep = lazy(() => import('./steps/TypographyMotionStep').then(m => ({ default: m.TypographyMotionStep })));

// Act III - Lazy Loaded
const FunctionalityStep = lazy(() => import('./steps/FunctionalityStep').then(m => ({ default: m.FunctionalityStep })));
const ReferencesStep = lazy(() => import('./steps/ReferencesStep').then(m => ({ default: m.ReferencesStep })));
const ReviewStep = lazy(() => import('./steps/ReviewStep').then(m => ({ default: m.ReviewStep })));

export interface StepRendererProps {
    act: ConfiguratorAct;
    step: number;
    blueprint: Blueprint;
    onUpdateDesign: (updates: Partial<BlueprintDesign>) => void;
    onUpdateDiscovery: (updates: Partial<BlueprintDiscovery>) => void;
    onUpdateDeliver: (updates: Partial<BlueprintDeliver>) => void;
    onUpdateReferences: (refs: BlueprintReference[]) => void;
    onUpdateUserDetails: (details: { firstName?: string; lastName?: string; userEmail?: string; businessName?: string }) => void;
    onSubmit: (userDetails?: { firstName?: string; lastName?: string; userEmail?: string; businessName?: string }) => Promise<boolean>;
    onBack: () => void;
    onNext: () => void;
    onGoToStep: (step: number) => void;
    onReviseVision?: () => void;
    stepRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export function StepRenderer({
    act,
    step,
    blueprint,
    onUpdateDesign,
    onUpdateDiscovery,
    onUpdateDeliver,
    onUpdateReferences,
    onUpdateUserDetails,
    onSubmit,
    onBack,
    onNext,
    onGoToStep,
    onReviseVision,
    stepRefs,
}: StepRendererProps) {
    const setRef = (index: number) => (el: HTMLDivElement | null) => {
        stepRefs.current[index] = el;
    };

    switch (step) {
        // Act I: Discovery (1-3)
        case 1:
            return (
                <BusinessFoundationsStep
                    ref={setRef(1)}
                    discovery={blueprint.discovery}
                    onUpdate={onUpdateDiscovery}
                    onNext={onNext}
                />
            );
        case 2:
            return (
                <BrandVoiceStep
                    ref={setRef(2)}
                    discovery={blueprint.discovery}
                    onUpdate={onUpdateDiscovery}
                    onBack={onBack}
                    onNext={onNext}
                />
            );
        case 3:
            return (
                <CTAEnergyStep
                    ref={setRef(3)}
                    discovery={blueprint.discovery}
                    onUpdate={onUpdateDiscovery}
                    onBack={onBack}
                    onNext={onNext}
                />
            );

        // Act II: Expression (4-6)
        case 4:
            return (
                <Suspense fallback={<div className="min-h-screen" />}>
                    <VisualStyleStep
                        ref={setRef(4)}
                        design={blueprint.design}
                        onUpdate={onUpdateDesign}
                        onBack={onBack}
                        onNext={onNext}
                    />
                </Suspense>
            );
        case 5:
            return (
                <Suspense fallback={<div className="min-h-screen" />}>
                    <TypographyMotionStep
                        ref={setRef(5)}
                        design={blueprint.design}
                        onUpdate={onUpdateDesign}
                        onBack={onBack}
                        onNext={onNext}
                    />
                </Suspense>
            );
        case 6:
            return (
                <Suspense fallback={<div className="min-h-screen" />}>
                    <ColorPaletteStep
                        ref={setRef(6)}
                        design={blueprint.design}
                        onUpdate={onUpdateDesign}
                        onBack={onBack}
                        onNext={onNext}
                    />
                </Suspense>
            );

        // Act III: Delivery (7-9)
        case 7:
            return (
                <Suspense fallback={<div className="min-h-screen" />}>
                    <FunctionalityStep
                        ref={setRef(7)}
                        deliver={blueprint.deliver}
                        onUpdate={onUpdateDeliver}
                        onBack={onBack}
                        onNext={onNext}
                    />
                </Suspense>
            );
        case 8:
            return (
                <Suspense fallback={<div className="min-h-screen" />}>
                    <CreativeRiskStep
                        ref={setRef(8)}
                        deliver={blueprint.deliver}
                        onUpdate={onUpdateDeliver}
                        onBack={onBack}
                        onNext={onNext}
                    />
                </Suspense>
            );
        case 9:
            return (
                <Suspense fallback={<div className="min-h-screen" />}>
                    <ReferencesStep
                        ref={setRef(9)}
                        blueprintId={blueprint.id}
                        references={blueprint.references as unknown as BlueprintReference[] || []}
                        onReferencesChange={onUpdateReferences}
                        onBack={onBack}
                        onNext={onNext}
                    />
                </Suspense>
            );
        case 10:
            return (
                <Suspense fallback={<div className="min-h-screen" />}>
                    <ReviewStep
                        ref={setRef(10)}
                        blueprint={blueprint}
                        references={blueprint.references as unknown as BlueprintReference[] || []}
                        onUpdateUserDetails={onUpdateUserDetails}
                        onGoToStep={onGoToStep}
                        onSubmit={onSubmit}
                        onBack={onBack}
                        onReviseVision={onReviseVision}
                    />
                </Suspense>
            );
        default:
            return null;
    }
}
