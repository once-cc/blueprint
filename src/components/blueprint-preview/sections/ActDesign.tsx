/**
 * ActDesign
 * 
 * ACT II: Design section - Visual Style, Typography & Motion, Color Palette
 */

import { 
  BlueprintDataContract, 
  getDisplayLabel,
  getDisplayNumber,
  VISUAL_STYLE_LABELS,
  TYPOGRAPHY_LABELS,
  COLOUR_RELATIONSHIP_LABELS,
} from '@/lib/blueprintDataContract';
import { NotProvided } from '../ui/NotProvided';
import { ColorSwatch } from '../ui/ColorSwatch';

interface ActDesignProps {
  contract: BlueprintDataContract;
}

export function ActDesign({ contract }: ActDesignProps) {
  const { design } = contract;
  const { visual_style, typography_motion, colour_imagery } = design;

  return (
    <div className="bp-page bp-page--content">
      <div className="bp-grid-overlay" />

      {/* Section Header */}
      <div className="bp-section-header">
        <span className="bp-section-number">II</span>
        <div>
          <p className="bp-act-title">Act II</p>
          <h2 className="bp-section-title">Design</h2>
          <p className="bp-meta">How you look</p>
        </div>
      </div>

      {/* Visual Style */}
      <div className="bp-section">
        <h3 className="bp-step-title">Visual Style</h3>

        <div className="bp-block-grid">
          <div className="bp-block">
            <p className="bp-label">Style Direction</p>
            <p className="bp-value">
              {getDisplayLabel(visual_style.style, VISUAL_STYLE_LABELS)}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Imagery Style</p>
            <p className="bp-value" style={{ textTransform: 'capitalize' }}>
              {visual_style.imagery_style || <NotProvided />}
            </p>
          </div>
        </div>
      </div>

      {/* Typography & Motion */}
      <div className="bp-section">
        <h3 className="bp-step-title">Typography & Motion</h3>

        <div className="bp-block-grid--three">
          <div className="bp-block">
            <p className="bp-label">Typography Style</p>
            <p className="bp-value">
              {getDisplayLabel(typography_motion.typography_style, TYPOGRAPHY_LABELS)}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Font Weight</p>
            <p className="bp-value" style={{ textTransform: 'capitalize' }}>
              {typography_motion.font_weight || <NotProvided />}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Animation Intensity</p>
            <p className="bp-value">
              {getDisplayNumber(typography_motion.animation_intensity, '/10')}
            </p>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="bp-section">
        <h3 className="bp-step-title">Colour Palette</h3>

        <div className="bp-block-grid mb-6">
          <div className="bp-block">
            <p className="bp-label">Colour Relationship</p>
            <p className="bp-value">
              {getDisplayLabel(colour_imagery.colour_relationship, COLOUR_RELATIONSHIP_LABELS)}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Base Hue</p>
            <p className="bp-value">
              {colour_imagery.base_hue !== null ? `${colour_imagery.base_hue}°` : <NotProvided />}
            </p>
          </div>
        </div>

        <div className="bp-block-grid mb-6">
          <div className="bp-block">
            <p className="bp-label">Palette Energy</p>
            <p className="bp-value">
              {getDisplayNumber(colour_imagery.palette_energy, '/10')}
            </p>
          </div>

          <div className="bp-block">
            <p className="bp-label">Palette Contrast</p>
            <p className="bp-value">
              {getDisplayNumber(colour_imagery.palette_contrast, '/10')}
            </p>
          </div>
        </div>

        {/* Color Swatches */}
        {colour_imagery.generated_palette.length > 0 ? (
          <div className="bp-block">
            <p className="bp-label">Generated Palette</p>
            <div className="bp-palette mt-4">
              {colour_imagery.generated_palette.map((swatch, index) => (
                <ColorSwatch 
                  key={index} 
                  role={swatch.role} 
                  color={swatch.color} 
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bp-block">
            <p className="bp-label">Generated Palette</p>
            <p className="bp-not-provided">No palette generated</p>
          </div>
        )}
      </div>
    </div>
  );
}
