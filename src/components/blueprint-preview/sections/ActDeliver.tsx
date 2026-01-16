/**
 * ActDeliver
 * 
 * ACT III: Deliver section - Functionality, Scope, Risk Tolerance
 */

import { 
  BlueprintDataContract, 
  getDisplayLabel,
  getDisplayNumber,
  TIMELINE_LABELS,
  BUDGET_LABELS,
} from '@/lib/blueprintDataContract';
import { NotProvided } from '../ui/NotProvided';

interface ActDeliverProps {
  contract: BlueprintDataContract;
}

export function ActDeliver({ contract }: ActDeliverProps) {
  const { deliver } = contract;

  return (
    <div className="bp-page bp-page--content">
      <div className="bp-grid-overlay" />

      {/* Section Header */}
      <div className="bp-section-header">
        <span className="bp-section-number">III</span>
        <div>
          <p className="bp-act-title">Act III</p>
          <h2 className="bp-section-title">Deliver</h2>
          <p className="bp-meta">What you need</p>
        </div>
      </div>

      {/* Pages & Features */}
      <div className="bp-section">
        <h3 className="bp-step-title">Functionality & Scope</h3>

        <div className="bp-block-grid">
          <div className="bp-block">
            <p className="bp-label">Pages</p>
            {deliver.pages.length > 0 ? (
              <div className="bp-tags">
                {deliver.pages.map((page) => (
                  <span key={page} className="bp-tag">{page}</span>
                ))}
              </div>
            ) : (
              <p className="bp-not-provided">No pages selected</p>
            )}
          </div>

          <div className="bp-block">
            <p className="bp-label">Features</p>
            {deliver.features.length > 0 ? (
              <div className="bp-tags">
                {deliver.features.map((feature) => (
                  <span key={feature} className="bp-tag">{feature}</span>
                ))}
              </div>
            ) : (
              <p className="bp-not-provided">No features selected</p>
            )}
          </div>
        </div>
      </div>

      {/* Service Buckets */}
      {deliver.service_buckets.length > 0 && (
        <div className="bp-section">
          <h3 className="bp-step-title">Additional Services</h3>

          <div className="space-y-4">
            {deliver.service_buckets.map((bucket) => (
              <div key={bucket.id} className="bp-block">
                <p className="bp-label">{bucket.label}</p>
                {bucket.selected_subs.length > 0 ? (
                  <div className="bp-tags">
                    {bucket.selected_subs.map((sub) => (
                      <span key={sub} className="bp-tag">{sub}</span>
                    ))}
                  </div>
                ) : (
                  <p className="bp-meta">Full service selected</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline & Budget */}
      <div className="bp-section">
        <h3 className="bp-step-title">Project Parameters</h3>

        <div className="bp-block-grid--three">
          <div className="bp-block">
            <p className="bp-label">Timeline</p>
            <p className="bp-value">
              {getDisplayLabel(deliver.timeline, TIMELINE_LABELS)}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Budget</p>
            <p className="bp-value">
              {getDisplayLabel(deliver.budget, BUDGET_LABELS)}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Creative Risk Tolerance</p>
            <p className="bp-value">
              {getDisplayNumber(deliver.risk_tolerance, '/10')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
