/**
 * SummaryPage
 * 
 * Final page with summary paragraph, CTA hierarchy, and portal access code.
 * This is the gateway into the Cleland Consultancy framework.
 */

import { BlueprintDataContract } from '@/lib/blueprintDataContract';
import { ExternalLink } from 'lucide-react';

interface SummaryPageProps {
  contract: BlueprintDataContract;
}

// Portal URL - central destination for all CTAs
const PORTAL_URL = 'https://portal.clelandconsultancy.com';

// Static access code for Phase 3 (v1)
const ACCESS_CODE = 'CCH0R$369';

export function SummaryPage({ contract }: SummaryPageProps) {
  const { meta } = contract;
  const displayName = meta.business_name || meta.client_name || 'your project';

  return (
    <div className="bp-page bp-page--content">
      <div className="bp-grid-overlay" />

      {/* Summary Section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="bp-act-title">Next Steps</p>
        <h2 className="bp-section-title" style={{ textAlign: 'center' }}>
          Your Blueprint is Complete
        </h2>
        
        <div className="mt-8 space-y-4">
          <p className="bp-body" style={{ textAlign: 'center' }}>
            This Blueprint defines the strategic, visual, and functional direction 
            of {displayName}. It serves as the alignment artifact we use to confirm 
            scope, priorities, and execution before build begins.
          </p>
        </div>

        {/* Artifact Framing */}
        <div className="bp-artifact-framing">
          <div className="bp-artifact-item">Design brief</div>
          <div className="bp-artifact-item">Alignment artifact</div>
          <div className="bp-artifact-item">Build reference</div>
        </div>
      </div>

      {/* CTA Hierarchy Block */}
      <div className="bp-cta-block">
        <h3 className="bp-cta-title">Continue Your Journey</h3>
        
        {/* Primary CTA */}
        <a 
          href="#"
          className="bp-cta-primary"
        >
          View Your Blueprint
        </a>

        {/* Secondary CTA */}
        <a 
          href={PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bp-cta-secondary"
        >
          <ExternalLink className="w-4 h-4" />
          Enter the Client Portal
        </a>
        
        <p className="bp-cta-microcopy">
          Your private workspace for next steps, documents, and correspondence.
        </p>

        {/* Tertiary CTA */}
        <a 
          href={PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bp-cta-tertiary"
        >
          Book a Clarity Call →
        </a>
      </div>

      {/* Access Code Block */}
      <div className="bp-access-code-block">
        <p className="bp-access-code-title">Client Portal Access</p>
        <p className="bp-access-code-description">
          Use your current access code to enter the private workspace:
        </p>
        <code className="bp-access-code">{ACCESS_CODE}</code>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="bp-meta">
          Crafted Blueprint™ by Cleland Studio
        </p>
        <p className="bp-meta mt-2">
          © {new Date().getFullYear()} Cleland Studio. All rights reserved.
        </p>
      </div>
    </div>
  );
}
