/**
 * ActDiscovery
 * 
 * ACT I: Discovery section - Business Foundations, Brand Voice, CTA Energy
 */

import { 
  BlueprintDataContract, 
  getDisplayLabel, 
  getDisplayLabels,
  PURPOSE_LABELS,
  CONVERSION_GOAL_LABELS,
  SALES_PERSONALITY_LABELS,
} from '@/lib/blueprintDataContract';
import { NotProvided } from '../ui/NotProvided';

interface ActDiscoveryProps {
  contract: BlueprintDataContract;
}

export function ActDiscovery({ contract }: ActDiscoveryProps) {
  const { discovery } = contract;
  const { business_foundations, brand_voice, cta_energy } = discovery;

  return (
    <div className="bp-page bp-page--content">
      <div className="bp-grid-overlay" />

      {/* Section Header */}
      <div className="bp-section-header">
        <span className="bp-section-number">I</span>
        <div>
          <p className="bp-act-title">Act I</p>
          <h2 className="bp-section-title">Discovery</h2>
          <p className="bp-meta">Who you are</p>
        </div>
      </div>

      {/* Business Foundations */}
      <div className="bp-section">
        <h3 className="bp-step-title">Business Foundations</h3>

        <div className="bp-block-grid">
          <div className="bp-block">
            <p className="bp-label">Industry / Site Topic</p>
            <p className="bp-value">
              {business_foundations.site_topic || <NotProvided />}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Primary Purpose</p>
            <p className="bp-value">
              {getDisplayLabel(business_foundations.primary_purpose, PURPOSE_LABELS)}
            </p>
          </div>
        </div>

        {business_foundations.secondary_purposes.length > 0 && (
          <div className="bp-block">
            <p className="bp-label">Secondary Purposes</p>
            <div className="bp-tags">
              {business_foundations.secondary_purposes.map((purpose) => (
                <span key={purpose} className="bp-tag">
                  {PURPOSE_LABELS[purpose] || purpose}
                </span>
              ))}
            </div>
          </div>
        )}

        {business_foundations.conversion_goals.length > 0 && (
          <div className="bp-block">
            <p className="bp-label">Conversion Goals</p>
            <div className="bp-tags">
              {business_foundations.conversion_goals.map((goal) => (
                <span key={goal} className="bp-tag">
                  {CONVERSION_GOAL_LABELS[goal] || goal}
                </span>
              ))}
            </div>
          </div>
        )}

        {Object.keys(business_foundations.advanced_objectives).length > 0 && (
          <div className="bp-block">
            <p className="bp-label">Strategic Details</p>
            <div className="bp-block-grid">
              {Object.entries(business_foundations.advanced_objectives).map(([key, value]) => (
                <div key={key}>
                  <p className="bp-meta" style={{ textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="bp-value">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brand Voice */}
      <div className="bp-section">
        <h3 className="bp-step-title">Brand Voice</h3>

        <div className="bp-block-grid">
          <div className="bp-block">
            <p className="bp-label">Tone</p>
            <p className="bp-value">
              {brand_voice.tone || <NotProvided />}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Presence</p>
            <p className="bp-value">
              {brand_voice.presence || <NotProvided />}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Personality</p>
            <p className="bp-value">
              {brand_voice.personality || <NotProvided />}
            </p>
          </div>
        </div>

        <div className="bp-block-grid mt-4">
          <div className="bp-block">
            <p className="bp-label">Visitor Energy</p>
            <p className="bp-value">
              {brand_voice.visitor_energy || <NotProvided />}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Visitor Confidence</p>
            <p className="bp-value">
              {brand_voice.visitor_confidence || <NotProvided />}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Energy */}
      <div className="bp-section">
        <h3 className="bp-step-title">CTA Energy</h3>

        <div className="bp-block-grid">
          <div className="bp-block">
            <p className="bp-label">Sales Personality</p>
            <p className="bp-value">
              {getDisplayLabel(cta_energy.sales_personality, SALES_PERSONALITY_LABELS)}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Primary CTA Label</p>
            <p className="bp-value--emphasis">
              {cta_energy.cta_primary_label ? `"${cta_energy.cta_primary_label}"` : <NotProvided />}
            </p>
          </div>
        </div>

        {cta_energy.cta_strategy_notes && (
          <div className="bp-block">
            <p className="bp-label">Strategy Notes</p>
            <p className="bp-body">{cta_energy.cta_strategy_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
