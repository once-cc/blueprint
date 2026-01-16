/**
 * CoverPage
 * 
 * Blueprint PDF cover page with title, business name, and date.
 */

import { BlueprintDataContract, formatContractDate } from '@/lib/blueprintDataContract';

interface CoverPageProps {
  contract: BlueprintDataContract;
}

export function CoverPage({ contract }: CoverPageProps) {
  const { meta } = contract;
  const displayName = meta.business_name || meta.client_name || 'Your Project';
  const submittedDate = formatContractDate(meta.submitted_at || meta.created_at);

  return (
    <div className="bp-page bp-page--cover">
      {/* Subtle grid watermark */}
      <div className="bp-grid-overlay" />

      {/* Main content */}
      <div className="relative z-10">
        {/* Title */}
        <h1 className="bp-cover-title">Crafted Blueprint</h1>
        
        {/* Subtitle */}
        <p className="bp-cover-subtitle">
          A Studio-Crafted Direction for Digital Design
        </p>

        {/* Divider */}
        <div className="bp-cover-divider" />

        {/* Client/Business name */}
        <p className="bp-cover-client">{displayName}</p>

        {/* Date */}
        <p className="bp-cover-date">{submittedDate}</p>

        {/* Dream Intent (if provided) */}
        {meta.dream_intent && (
          <div className="mt-12 max-w-md mx-auto">
            <p className="bp-label">Vision</p>
            <p className="bp-value--emphasis text-center">
              "{meta.dream_intent}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
