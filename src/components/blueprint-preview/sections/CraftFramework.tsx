/**
 * CraftFramework
 * 
 * The C.R.A.F.T.™ Framework section showing the 5-stage process ladder.
 * Displays completed status for Crafted Blueprint and next step for Clarify the Vision.
 */

import { Check, ArrowRight } from 'lucide-react';

const CRAFT_STAGES = [
  {
    letter: 'C',
    title: 'Clarify the Vision',
    action: 'Clarity / Strategy Call',
    output: 'Vision + Project Brief',
    status: 'next' as const,
  },
  {
    letter: 'R',
    title: 'Research & Refine',
    action: 'Research Sprint',
    output: 'Market Positioning + Strategy',
    status: 'pending' as const,
  },
  {
    letter: 'A',
    title: 'Architect & Align',
    action: 'Planning Session',
    output: 'Approved Blueprint + Build Plan',
    status: 'pending' as const,
  },
  {
    letter: 'F',
    title: 'Forge the Foundation',
    action: 'Build Phase',
    output: 'Platform + Brand Assets',
    status: 'pending' as const,
  },
  {
    letter: 'T',
    title: 'Transform & Launch',
    action: 'Launch',
    output: 'Live Platform + Support',
    status: 'pending' as const,
  },
];

export function CraftFramework() {
  return (
    <div className="bp-page bp-page--content">
      <div className="bp-grid-overlay" />

      {/* Section Header */}
      <div className="text-center mb-8">
        <p className="bp-act-title">The Process</p>
        <h2 className="bp-section-title" style={{ textAlign: 'center' }}>
          The C.R.A.F.T.™ Framework
        </h2>
        <p className="bp-meta" style={{ maxWidth: '400px', margin: '0 auto' }}>
          A clear path from Blueprint to build. Your journey through our
          studio-grade design and development process.
        </p>
      </div>

      {/* Completion Banner */}
      <div className="bp-completion-banner">
        <Check className="w-5 h-5" />
        <span>You completed: <strong>Crafted Blueprint</strong></span>
      </div>

      {/* Next Step Indicator */}
      <div className="bp-next-step-banner">
        <ArrowRight className="w-4 h-4" />
        <span>Next: Clarity Call (Clarify the Vision)</span>
      </div>

      {/* CRAFT Ladder */}
      <div className="bp-craft-ladder">
        {CRAFT_STAGES.map((stage) => (
          <div
            key={stage.letter}
            className={`bp-craft-step ${stage.status === 'next' ? 'bp-craft-step--next' : ''
              }`}
          >
            <span className="bp-craft-letter">{stage.letter}</span>

            <div className="bp-craft-content">
              <p className="bp-craft-title">{stage.title}</p>
              <div className="bp-craft-details">
                <p className="bp-craft-action">
                  <span className="bp-craft-detail-label">Action:</span> {stage.action}
                </p>
                <p className="bp-craft-output">
                  <span className="bp-craft-detail-label">Output:</span> {stage.output}
                </p>
              </div>
            </div>

            {stage.status === 'next' && (
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-[var(--bp-accent-blue)]" />
                <span className="bp-craft-status bp-craft-status--next">
                  Next Step
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--bp-accent-gold)' }}
          />
          <span className="bp-meta">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--bp-accent-blue)' }}
          />
          <span className="bp-meta">Next Step</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full border"
            style={{ borderColor: 'var(--bp-border)' }}
          />
          <span className="bp-meta">Upcoming</span>
        </div>
      </div>
    </div>
  );
}
