/**
 * ReferencesGallery
 * 
 * Displays uploaded reference images with role labels.
 */

import { REFERENCE_ROLE_LABELS } from '@/lib/blueprintDataContract';

interface Reference {
  id: string;
  type: string;
  url: string;
  role: string | null;
  label: string | null;
  filename: string | null;
}

interface ReferencesGalleryProps {
  references: Reference[];
}

export function ReferencesGallery({ references }: ReferencesGalleryProps) {
  // Filter to only image types for the gallery
  const imageReferences = references.filter(
    ref => ref.type === 'image' || ref.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );

  if (imageReferences.length === 0) {
    return null;
  }

  return (
    <div className="bp-page bp-page--content">
      <div className="bp-grid-overlay" />

      {/* Section Header */}
      <div className="bp-section-header">
        <div>
          <p className="bp-act-title">References</p>
          <h2 className="bp-section-title">Inspiration Gallery</h2>
          <p className="bp-meta">Visual references and inspiration</p>
        </div>
      </div>

      {/* References Grid */}
      <div className="bp-references-grid">
        {imageReferences.map((ref) => (
          <div key={ref.id} className="bp-reference-card">
            <img 
              src={ref.url} 
              alt={ref.label || ref.filename || 'Reference image'}
              className="bp-reference-image"
              loading="lazy"
            />
            <div className="bp-reference-overlay">
              <p className="bp-reference-role">
                {ref.role ? REFERENCE_ROLE_LABELS[ref.role] || ref.role : 'Reference'}
              </p>
              {ref.label && (
                <p className="bp-meta mt-1">{ref.label}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Link references (non-image) */}
      {references.filter(ref => ref.type === 'link').length > 0 && (
        <div className="mt-8">
          <p className="bp-label mb-4">Website References</p>
          <div className="space-y-2">
            {references
              .filter(ref => ref.type === 'link')
              .map((ref) => (
                <div key={ref.id} className="flex items-center gap-3">
                  <span className="bp-tag">
                    {ref.role ? REFERENCE_ROLE_LABELS[ref.role] || ref.role : 'Link'}
                  </span>
                  <a 
                    href={ref.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bp-body text-[var(--bp-accent-blue)] hover:underline"
                  >
                    {ref.label || ref.url}
                  </a>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
