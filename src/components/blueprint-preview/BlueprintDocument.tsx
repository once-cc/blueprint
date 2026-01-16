/**
 * BlueprintDocument
 * 
 * Main document container for the Blueprint PDF preview.
 * This component renders the complete editorial document using
 * the canonical BlueprintDataContract.
 */

import { BlueprintDataContract } from '@/lib/blueprintDataContract';
import { CoverPage } from './sections/CoverPage';
import { ActDiscovery } from './sections/ActDiscovery';
import { ActDesign } from './sections/ActDesign';
import { ActDeliver } from './sections/ActDeliver';
import { ReferencesGallery } from './sections/ReferencesGallery';
import { CraftFramework } from './sections/CraftFramework';
import { SummaryPage } from './sections/SummaryPage';
import './tokens.css';

interface BlueprintDocumentProps {
  contract: BlueprintDataContract;
}

export function BlueprintDocument({ contract }: BlueprintDocumentProps) {
  const hasReferences = contract.references.length > 0;

  return (
    <div className="blueprint-document">
      {/* Cover Page */}
      <CoverPage contract={contract} />

      {/* ACT I: Discovery */}
      <ActDiscovery contract={contract} />

      {/* ACT II: Design */}
      <ActDesign contract={contract} />

      {/* ACT III: Deliver */}
      <ActDeliver contract={contract} />

      {/* References Gallery (conditional) */}
      {hasReferences && <ReferencesGallery references={contract.references} />}

      {/* C.R.A.F.T.™ Framework */}
      <CraftFramework />

      {/* Summary + CTA */}
      <SummaryPage contract={contract} />
    </div>
  );
}
